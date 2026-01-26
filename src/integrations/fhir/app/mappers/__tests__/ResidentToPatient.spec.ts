import type { Patient } from 'fhir/r4'
import { describe, expect, it } from 'vitest'

import type { Resident } from '@/business/residents/domain/Resident'

import { patientToResident, residentToPatient } from '../ResidentToPatient'

describe('ResidentToPatient mapper', () => {
	describe('residentToPatient', () => {
		it('should convert Resident to FHIR Patient', () => {
			const resident: Resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth: new Date(1950, 0, 15),
				medicalInfo: {},
				emergencyContacts: [
					{
						name: 'María Pérez',
						relationship: 'spouse',
						phone: '+34 600 000 000',
						email: 'maria@example.com',
					},
				],
				assignedCaregivers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			const patient = residentToPatient(resident, 'patient-1')

			expect(patient.resourceType).toBe('Patient')
			expect(patient.id).toBe('patient-1')
			expect(patient.name?.[0]?.family).toBe('Pérez')
			expect(patient.name?.[0]?.given).toEqual(['Juan'])
			expect(patient.birthDate).toBe('1950-01-15')
			expect(patient.contact).toHaveLength(1)
			expect(patient.contact?.[0]?.telecom).toHaveLength(2) // phone + email
		})

		it('should generate FHIR ID if not provided', () => {
			const resident: Resident = {
				id: 'resident-2',
				firstName: 'María',
				lastName: 'García',
				dateOfBirth: new Date(1960, 5, 20),
				medicalInfo: {},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			const patient = residentToPatient(resident)

			expect(patient.id).toBeDefined()
			expect(patient.id).toMatch(/^fhir-/)
		})

		it('should handle resident with multiple emergency contacts', () => {
			const resident: Resident = {
				id: 'resident-3',
				firstName: 'Carlos',
				lastName: 'López',
				dateOfBirth: new Date(1945, 2, 10),
				medicalInfo: {},
				emergencyContacts: [
					{
						name: 'Contact 1',
						relationship: 'family',
						phone: '123-456-789',
					},
					{
						name: 'Contact 2',
						relationship: 'friend',
						phone: '987-654-321',
						email: 'contact2@example.com',
					},
				],
				assignedCaregivers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			const patient = residentToPatient(resident, 'patient-3')

			expect(patient.contact).toHaveLength(2)
		})

		it('should format birth date correctly', () => {
			const resident: Resident = {
				id: 'resident-4',
				firstName: 'Test',
				lastName: 'User',
				dateOfBirth: new Date(1980, 11, 31),
				medicalInfo: {},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			const patient = residentToPatient(resident, 'patient-4')

			expect(patient.birthDate).toBe('1980-12-31')
		})
	})

	describe('patientToResident', () => {
		it('should convert FHIR Patient to Resident (partial)', () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'patient-1',
				name: [
					{
						use: 'official',
						family: 'Pérez',
						given: ['Juan'],
					},
				],
				birthDate: '1950-01-15',
				contact: [
					{
						relationship: [
							{
								coding: [
									{
										system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
										code: 'SPO',
										display: 'spouse',
									},
								],
							},
						],
						name: {
							text: 'María Pérez',
						},
						telecom: [
							{ system: 'phone', value: '+34 600 000 000' },
							{ system: 'email', value: 'maria@example.com' },
						],
					},
				],
			}

			const resident = patientToResident(patient, 'resident-1')

			expect(resident.id).toBe('resident-1')
			expect(resident.firstName).toBe('Juan')
			expect(resident.lastName).toBe('Pérez')
			expect(resident.dateOfBirth).toBeInstanceOf(Date)
			expect(resident.emergencyContacts).toHaveLength(1)
			expect(resident.emergencyContacts?.[0]?.phone).toBe('+34 600 000 000')
			expect(resident.emergencyContacts?.[0]?.email).toBe('maria@example.com')
		})

		it('should handle patient with no name', () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'patient-2',
				birthDate: '1950-01-01',
			}

			const resident = patientToResident(patient, 'resident-2')

			expect(resident.firstName).toBe('')
			expect(resident.lastName).toBe('')
		})
	})
})
