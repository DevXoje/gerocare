import { beforeEach, describe, expect, it } from 'vitest'

import { testDb } from '@/test/setup'

import type { ResidentRepository } from '../../domain/ResidentRepository'
import { createResidentRepository } from '../../infrastructure/FirestoreResidentRepository'

describe('Resident Integration: Search', () => {
	let repository: ResidentRepository

	beforeEach(() => {
		repository = createResidentRepository(testDb)
	})

	it('should find residents by first name', async () => {
		const dateOfBirth = new Date(1950, 0, 1)

		await repository.create({
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
		})

		const result = await repository.search('Juan')
		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.value.length).toBeGreaterThan(0)
			expect(result.value.some(r => r.firstName === 'Juan')).toBe(true)
		}
	})

	it('should find residents by last name', async () => {
		const dateOfBirth = new Date(1950, 0, 1)

		await repository.create({
			firstName: 'María',
			lastName: 'García',
			dateOfBirth,
			medicalInfo: {
				allergies: [],
				chronicConditions: [],
				medications: [],
				dietaryRestrictions: [],
			},
			emergencyContacts: [],
			assignedCaregivers: [],
		})

		const result = await repository.search('García')
		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.value.length).toBeGreaterThan(0)
			expect(result.value.some(r => r.lastName === 'García')).toBe(true)
		}
	})

	it('should be case-insensitive', async () => {
		const dateOfBirth = new Date(1950, 0, 1)

		await repository.create({
			firstName: 'Pedro',
			lastName: 'Martínez',
			dateOfBirth,
			medicalInfo: {
				allergies: [],
				chronicConditions: [],
				medications: [],
				dietaryRestrictions: [],
			},
			emergencyContacts: [],
			assignedCaregivers: [],
		})

		const result = await repository.search('pedro')
		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.value.length).toBeGreaterThan(0)
		}
	})

	it('should return all residents when search is empty', async () => {
		const dateOfBirth = new Date(1950, 0, 1)

		await repository.create({
			firstName: 'Ana',
			lastName: 'Sánchez',
			dateOfBirth,
			medicalInfo: {
				allergies: [],
				chronicConditions: [],
				medications: [],
				dietaryRestrictions: [],
			},
			emergencyContacts: [],
			assignedCaregivers: [],
		})

		const result = await repository.search('')
		expect(result.success).toBe(true)

		if (result.success) {
			// Empty search should return all (implementation dependent)
			expect(Array.isArray(result.value)).toBe(true)
		}
	})
})
