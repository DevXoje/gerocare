import { describe, expect, it } from 'vitest'

import type { Resident } from '../Resident'
import { calculateAge, validateResident } from '../Resident'

describe('Resident Entity', () => {
	describe('createResident', () => {
		it('should create a resident instance with valid data', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident: Resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			}

			expect(resident.firstName).toBe('Juan')
			expect(resident.lastName).toBe('Pérez')
			expect(resident.dateOfBirth).toEqual(dateOfBirth)
		})
	})

	describe('calculateAge', () => {
		it('should calculate age correctly from dateOfBirth', () => {
			const today = new Date()
			const birthDate = new Date(today.getFullYear() - 75, today.getMonth(), today.getDate())

			const age = calculateAge(birthDate)
			expect(age).toBe(75)
		})

		it('should handle birthday not yet occurred this year', () => {
			const today = new Date()
			const birthDate = new Date(today.getFullYear() - 75, today.getMonth() + 1, today.getDate())

			const age = calculateAge(birthDate)
			expect(age).toBe(74)
		})
	})

	describe('validateResident', () => {
		it('should validate a resident with all required fields', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident: Resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			}

			const result = validateResident(resident)
			expect(result.success).toBe(true)
		})

		it('should fail validation if firstName is missing', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident = {
				id: 'resident-1',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			} satisfies Partial<Resident>

			const result = validateResident(resident)
			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			expect('error' in result ? result.error.message : '').toContain('firstName')
		})

		it('should fail validation if lastName is missing', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident = {
				id: 'resident-1',
				firstName: 'Juan',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			} satisfies Partial<Resident>

			const result = validateResident(resident)
			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			expect('error' in result ? result.error.message : '').toContain('lastName')
		})

		it('should fail validation if dateOfBirth is missing', () => {
			const now = new Date()

			const resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			} satisfies Partial<Resident>

			const result = validateResident(resident)
			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			expect('error' in result ? result.error.message : '').toContain('dateOfBirth')
		})

		it('should validate email format in emergencyContacts', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident: Resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [
					{
						name: 'María Pérez',
						relationship: 'Hija',
						phone: '+34600123456',
						email: 'invalid-email',
					},
				],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			}

			const result = validateResident(resident)
			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			expect('error' in result ? result.error.message : '').toContain('email')
		})

		it('should accept valid email in emergencyContacts', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident: Resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [
					{
						name: 'María Pérez',
						relationship: 'Hija',
						phone: '+34600123456',
						email: 'maria.perez@example.com',
					},
				],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			}

			const result = validateResident(resident)
			expect(result.success).toBe(true)
		})

		it('should validate that assignedCaregivers is an array of strings', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {
					allergies: [],
					chronicConditions: [],
					medications: [],
					dietaryRestrictions: [],
				},
				emergencyContacts: [],
				assignedCaregivers: [123, 456],
				createdAt: now,
				updatedAt: now,
			} satisfies Partial<Resident> & { assignedCaregivers: unknown[] }

			const result = validateResident(resident)
			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			expect('error' in result ? result.error.message : '').toContain('assignedCaregivers')
		})

		it('should validate medicalInfo structure', () => {
			const dateOfBirth = new Date(1950, 0, 1)
			const now = new Date()

			const resident = {
				id: 'resident-1',
				firstName: 'Juan',
				lastName: 'Pérez',
				dateOfBirth,
				medicalInfo: {},
				emergencyContacts: [],
				assignedCaregivers: [],
				createdAt: now,
				updatedAt: now,
			} satisfies Resident

			const result = validateResident(resident)
			expect(result.success).toBe(false)
		})
	})
})
