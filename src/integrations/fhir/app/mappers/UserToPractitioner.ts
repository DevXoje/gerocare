import type { Practitioner } from 'fhir/r4'

import type { User } from '@/business/auth/domain/User'
import { generateFHIRId } from '@/integrations/fhir/domain/FHIRResource'

/**
 * Convert GeroCare User (caregiver) to FHIR Practitioner
 */
export function userToPractitioner(user: User, fhirId?: string): Practitioner {
	const practitionerId = fhirId || generateFHIRId()

	return {
		resourceType: 'Practitioner',
		id: practitionerId,
		identifier: [
			{
				system: 'http://gerocare.app/practitioner',
				value: user.uid,
			},
		],
		name: user.displayName
			? [
					{
						use: 'official',
						text: user.displayName,
						// Try to parse displayName into given/family if it contains a space
						...(user.displayName.includes(' ')
							? parseName(user.displayName)
							: { given: [user.displayName] }),
					},
				]
			: [],
		telecom: user.email
			? [
					{
						system: 'email' as const,
						value: user.email,
					},
				]
			: [],
		photo: user.photoURL
			? [
					{
						url: user.photoURL,
					},
				]
			: [],
		active: true,
	}
}

/**
 * Convert FHIR Practitioner to GeroCare User (partial)
 * Note: This is a simplified mapping - full reverse mapping would require more logic
 */
export function practitionerToUser(practitioner: Practitioner, userId: string): Partial<User> {
	const name = practitioner.name?.[0]
	const email = practitioner.telecom?.find((t) => t.system === 'email')?.value
	const photo = practitioner.photo?.[0]?.url

	return {
		uid: userId,
		displayName: name?.text || name?.given?.join(' ') || null,
		email: email || null,
		photoURL: photo || null,
		emailVerified: false, // Would need to be set separately
	}
}

/**
 * Parse a full name string into given and family
 * Simple implementation - assumes "First Last" format
 */
function parseName(fullName: string): { given: string[]; family?: string } {
	const parts = fullName.trim().split(/\s+/)
	if (parts.length === 1) {
		return { given: [parts[0]!] }
	}

	const given = parts.slice(0, -1)
	const family = parts[parts.length - 1]

	return {
		given,
		family,
	}
}
