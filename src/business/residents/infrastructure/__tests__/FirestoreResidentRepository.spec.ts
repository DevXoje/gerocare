import { beforeEach, describe, expect, it } from 'vitest'

import { testDb } from '@/test/setup'

import type { ResidentRepository } from '../../domain/ResidentRepository'
import { createResidentRepository } from '../FirestoreResidentRepository'

describe('FirestoreResidentRepository', () => {
	let repository: ResidentRepository

	beforeEach(() => {
		repository = createResidentRepository(testDb)
	})

	describe('create', () => {
		it('should create a resident in Firestore', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const residentData = {
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
				assignedCaregivers: ['caregiver-1'],
			}

			const result = await repository.create(residentData)

			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			const resident = (
				result as {
					value: {
						id: string
						firstName: string
						lastName: string
						createdAt: Date
						updatedAt: Date
					}
				}
			).value
			expect(resident.id).toBeDefined()
			expect(resident.firstName).toBe('Juan')
			expect(resident.lastName).toBe('Pérez')
			expect(resident.createdAt).toBeInstanceOf(Date)
			expect(resident.updatedAt).toBeInstanceOf(Date)
		})
	})

	describe('findById', () => {
		it('should find a resident by ID', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const residentData = {
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
			}

			const createResult = await repository.create(residentData)
			expect(createResult.success).toBe(true)
			expect(createResult).toHaveProperty('value')
			const createdResident = (createResult as { value: { id: string } }).value

			const findResult = await repository.findById(createdResident.id)
			expect(findResult.success).toBe(true)
			expect(findResult).toHaveProperty('value')
			const foundResident = (findResult as { value: { id: string; firstName: string } | null })
				.value
			expect(foundResident).not.toBeNull()
			expect(foundResident!.id).toBe(createdResident.id)
			expect(foundResident!.firstName).toBe('Juan')
		})

		it('should return null if resident not found', async () => {
			const result = await repository.findById('non-existent-id')
			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			expect((result as { value: unknown }).value).toBeNull()
		})
	})

	describe('findAll', () => {
		it('should find all residents', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const resident1 = {
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
			}

			const resident2 = {
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
			}

			await repository.create(resident1)
			await repository.create(resident2)

			const result = await repository.findAll()
			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			expect((result as { value: unknown[] }).value.length).toBeGreaterThanOrEqual(2)
		})
	})

	describe('findByCaregiver', () => {
		it('should find residents assigned to a caregiver', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const resident1 = {
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
				assignedCaregivers: ['caregiver-1'],
			}

			const resident2 = {
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
				assignedCaregivers: ['caregiver-2'],
			}

			await repository.create(resident1)
			await repository.create(resident2)

			const result = await repository.findByCaregiver('caregiver-1')
			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			const residents = (result as { value: Array<{ assignedCaregivers: string[] }> }).value
			expect(residents.length).toBe(1)
			expect(residents[0]?.assignedCaregivers).toContain('caregiver-1')
		})
	})

	describe('update', () => {
		it('should update an existing resident', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const residentData = {
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
			}

			const createResult = await repository.create(residentData)
			expect(createResult.success).toBe(true)
			expect(createResult).toHaveProperty('value')
			const createdResident = (createResult as { value: { id: string } }).value

			const updateResult = await repository.update(createdResident.id, {
				firstName: 'Juan Carlos',
			})

			expect(updateResult.success).toBe(true)
			expect(updateResult).toHaveProperty('value')
			const updatedResident = (updateResult as { value: { firstName: string; lastName: string } })
				.value
			expect(updatedResident.firstName).toBe('Juan Carlos')
			expect(updatedResident.lastName).toBe('Pérez')
		})
	})

	describe('delete', () => {
		it('should delete a resident', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const residentData = {
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
			}

			const createResult = await repository.create(residentData)
			expect(createResult.success).toBe(true)
			expect(createResult).toHaveProperty('value')
			const createdResident = (createResult as { value: { id: string } }).value

			const deleteResult = await repository.delete(createdResident.id)
			expect(deleteResult.success).toBe(true)

			const findResult = await repository.findById(createdResident.id)
			expect(findResult.success).toBe(true)
			expect(findResult).toHaveProperty('value')
			expect((findResult as { value: unknown }).value).toBeNull()
		})
	})

	describe('search', () => {
		it('should search residents by first name', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const resident1 = {
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
			}

			const resident2 = {
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
			}

			await repository.create(resident1)
			await repository.create(resident2)

			const result = await repository.search('Juan')
			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			const residents = (result as { value: Array<{ firstName: string }> }).value
			expect(residents.length).toBeGreaterThanOrEqual(1)
			expect(residents.some(r => r.firstName === 'Juan')).toBe(true)
		})

		it('should search residents by last name', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const resident1 = {
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
			}

			await repository.create(resident1)

			const result = await repository.search('Pérez')
			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			const residents = (result as { value: Array<{ lastName: string }> }).value
			expect(residents.length).toBeGreaterThanOrEqual(1)
			expect(residents.some(r => r.lastName === 'Pérez')).toBe(true)
		})

		it('should be case-insensitive', async () => {
			const dateOfBirth = new Date(1950, 0, 1)

			const resident1 = {
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
			}

			await repository.create(resident1)

			const result = await repository.search('juan')
			expect(result.success).toBe(true)
			expect(result).toHaveProperty('value')
			expect((result as { value: unknown[] }).value.length).toBeGreaterThanOrEqual(1)
		})
	})
})
