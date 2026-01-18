import { expect } from 'vitest'

import type { Resident } from '@/business/residents/domain/Resident'
import { calculateAge } from '@/business/residents/domain/Resident'

/**
 * Custom matchers for Vitest to simplify domain-specific assertions
 */

declare module 'vitest' {
	interface Assertion {
		/**
		 * Asserts that the value is a valid Resident entity
		 */
		toBeValidResident(): void
		/**
		 * Asserts that the Resident has the specified age
		 */
		toHaveAge(age: number): void
	}
}

expect.extend({
	/**
	 * Validates that a value is a valid Resident entity with all required fields
	 */
	toBeValidResident(received: Resident) {
		const pass =
			typeof received === 'object' &&
			received !== null &&
			typeof received.id === 'string' &&
			typeof received.firstName === 'string' &&
			typeof received.lastName === 'string' &&
			received.dateOfBirth instanceof Date &&
			typeof received.medicalInfo === 'object' &&
			Array.isArray(received.medicalInfo.allergies) &&
			Array.isArray(received.medicalInfo.chronicConditions) &&
			Array.isArray(received.medicalInfo.medications) &&
			Array.isArray(received.medicalInfo.dietaryRestrictions) &&
			Array.isArray(received.emergencyContacts) &&
			Array.isArray(received.assignedCaregivers) &&
			received.createdAt instanceof Date &&
			received.updatedAt instanceof Date

		if (pass) {
			return {
				message: () => `expected ${JSON.stringify(received)} not to be a valid Resident`,
				pass: true,
			}
		} else {
			const missingFields: string[] = []

			if (typeof received !== 'object' || received === null) {
				missingFields.push('must be an object')
			} else {
				if (typeof received.id !== 'string') missingFields.push('id (string)')
				if (typeof received.firstName !== 'string') missingFields.push('firstName (string)')
				if (typeof received.lastName !== 'string') missingFields.push('lastName (string)')
				if (!(received.dateOfBirth instanceof Date)) missingFields.push('dateOfBirth (Date)')
				if (typeof received.medicalInfo !== 'object') missingFields.push('medicalInfo (object)')
				if (!Array.isArray(received.emergencyContacts))
					missingFields.push('emergencyContacts (array)')
				if (!Array.isArray(received.assignedCaregivers))
					missingFields.push('assignedCaregivers (array)')
				if (!(received.createdAt instanceof Date)) missingFields.push('createdAt (Date)')
				if (!(received.updatedAt instanceof Date)) missingFields.push('updatedAt (Date)')
			}

			return {
				message: () =>
					`expected ${JSON.stringify(received)} to be a valid Resident.\nMissing or invalid fields: ${missingFields.join(', ')}`,
				pass: false,
			}
		}
	},

	/**
	 * Validates that a Resident has the specified age
	 */
	toHaveAge(received: Resident, expectedAge: number) {
		if (!(received instanceof Object) || !('dateOfBirth' in received)) {
			return {
				message: () => `expected ${JSON.stringify(received)} to be a Resident with dateOfBirth`,
				pass: false,
			}
		}

		const calculatedAge = calculateAge(received.dateOfBirth)

		if (calculatedAge === expectedAge) {
			return {
				message: () => `expected resident not to have age ${expectedAge}, but got ${calculatedAge}`,
				pass: true,
			}
		} else {
			return {
				message: () =>
					`expected resident to have age ${expectedAge}, but got ${calculatedAge} (dateOfBirth: ${received.dateOfBirth.toISOString()})`,
				pass: false,
			}
		}
	},
})
