import type { Patient } from 'fhir/r4'

import type { Resident } from '@/business/residents/domain/Resident'
import { generateFHIRId } from '@/integrations/fhir/domain/FHIRResource'

/**
 * Convert GeroCare Resident to FHIR Patient
 */
export function residentToPatient(resident: Resident, fhirId?: string): Patient {
	const patientId = fhirId || generateFHIRId()

	return {
		resourceType: 'Patient',
		id: patientId,
		name: [
			{
				use: 'official',
				family: resident.lastName,
				given: [resident.firstName],
			},
		],
		birthDate: formatFHIRDate(resident.dateOfBirth),
		contact: resident.emergencyContacts.map((contact) => ({
			relationship: [
				{
					coding: [
						{
							system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
							code: mapRelationshipToCode(contact.relationship),
							display: contact.relationship,
						},
					],
				},
			],
			name: {
				text: contact.name,
			},
			telecom: [
				...(contact.phone
					? [
							{
								system: 'phone' as const,
								value: contact.phone,
							},
						]
					: []),
				...(contact.email
					? [
							{
								system: 'email' as const,
								value: contact.email,
							},
						]
					: []),
			],
		})),
		meta: {
			lastUpdated: resident.updatedAt.toISOString(),
		},
	}
}

/**
 * Convert FHIR Patient to GeroCare Resident (partial - only for updates)
 * Note: This is a simplified mapping - full reverse mapping would require more logic
 */
export function patientToResident(patient: Patient, residentId: string): Partial<Resident> {
	const name = patient.name?.[0] || {}

	return {
		id: residentId,
		firstName: name.given?.[0] || '',
		lastName: name.family || '',
		dateOfBirth: patient.birthDate ? new Date(patient.birthDate) : new Date(),
		emergencyContacts: (patient.contact || []).map((contact) => ({
			name: contact.name?.text || contact.name?.given?.[0] || '',
			relationship:
				contact.relationship?.[0]?.coding?.[0]?.display ||
				contact.relationship?.[0]?.coding?.[0]?.code ||
				'unknown',
			phone: contact.telecom?.find((t) => t.system === 'phone')?.value || '',
			email: contact.telecom?.find((t) => t.system === 'email')?.value,
		})),
	}
}

/**
 * Format JavaScript Date to FHIR date string (YYYY-MM-DD)
 */
function formatFHIRDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Map relationship string to HL7 v2.0131 code
 * This is a simplified mapping - in production, use a proper terminology server
 */
function mapRelationshipToCode(relationship: string): string {
	const relationshipMap: Record<string, string> = {
		family: 'FAM',
		spouse: 'SPO',
		child: 'CHILD',
		parent: 'PRN',
		friend: 'FRND',
		other: 'OTH',
	}

	const lower = relationship.toLowerCase()
	return relationshipMap[lower] || relationshipMap.other || 'OTH'
}
