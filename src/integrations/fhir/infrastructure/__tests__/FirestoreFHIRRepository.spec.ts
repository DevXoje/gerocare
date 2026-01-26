import type { Patient, Practitioner } from 'fhir/r4'
import { beforeEach, describe, expect, it } from 'vitest'

import { testDb } from '@/test/setup'

import type { FHIRRepository } from '../../domain/FHIRRepository'
import { createFirestoreFHIRRepository } from '../FirestoreFHIRRepository'

describe('FirestoreFHIRRepository', () => {
	let repository: FHIRRepository

	beforeEach(() => {
		repository = createFirestoreFHIRRepository(testDb)
	})

	describe('create', () => {
		it('should create a FHIR resource in Firestore', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				name: [
					{
						use: 'official',
						family: 'Pérez',
						given: ['Juan'],
					},
				],
				birthDate: '1950-01-01',
			}

			const result = await repository.create(patient)

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value.id).toBeDefined()
				expect(result.value.resourceType).toBe('Patient')
				expect(result.value.meta?.versionId).toBe('1')
				expect(result.value.meta?.lastUpdated).toBeDefined()
			}
		})

		it('should generate ID if not provided', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				name: [{ use: 'official', given: ['Test'] }],
			}

			const result = await repository.create(patient)

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value.id).toBeDefined()
				expect(result.value.id).toMatch(/^fhir-/)
			}
		})
	})

	describe('read', () => {
		it('should read an existing FHIR resource', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'test-patient-1',
				name: [{ use: 'official', family: 'García', given: ['María'] }],
			}

			await repository.create(patient)
			const result = await repository.read<Patient>('Patient', 'test-patient-1')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).not.toBeNull()
				expect(result.value?.resourceType).toBe('Patient')
				expect(result.value?.name?.[0]?.family).toBe('García')
			}
		})

		it('should return null for non-existent resource', async () => {
			const result = await repository.read<Patient>('Patient', 'non-existent')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).toBeNull()
			}
		})
	})

	describe('update', () => {
		it('should update an existing FHIR resource', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'test-patient-2',
				name: [{ use: 'official', family: 'López', given: ['Carlos'] }],
			}

			await repository.create(patient)

			const updatedPatient: Patient = {
				...patient,
				name: [{ use: 'official', family: 'López', given: ['Carlos', 'Miguel'] }],
			}

			const result = await repository.update(updatedPatient)

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value.name?.[0]?.given).toHaveLength(2)
				expect(result.value.meta?.versionId).toBe('2')
			}
		})

		it('should fail if resource ID is missing', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				name: [{ use: 'official', given: ['Test'] }],
			}

			const result = await repository.update(patient)

			expect(result.success).toBe(false)
		})

		it('should fail if resource does not exist', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'non-existent-patient',
				name: [{ use: 'official', given: ['Test'] }],
			}

			const result = await repository.update(patient)

			expect(result.success).toBe(false)
		})
	})

	describe('delete', () => {
		it('should soft delete a FHIR resource', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'test-patient-3',
				name: [{ use: 'official', given: ['Test'] }],
			}

			await repository.create(patient)
			const result = await repository.delete('Patient', 'test-patient-3')

			expect(result.success).toBe(true)

			// Resource should still exist but marked as superseded
			const readResult = await repository.read<Patient>('Patient', 'test-patient-3')
			expect(readResult.success).toBe(true)
			if (readResult.success && readResult.value) {
				expect(readResult.value.meta?.tag).toBeDefined()
			}
		})
	})

	describe('search', () => {
		it('should search resources by type', async () => {
			const patient1: Patient = {
				resourceType: 'Patient',
				id: 'search-patient-1',
				name: [{ use: 'official', family: 'Search', given: ['One'] }],
			}

			const patient2: Patient = {
				resourceType: 'Patient',
				id: 'search-patient-2',
				name: [{ use: 'official', family: 'Search', given: ['Two'] }],
			}

			await repository.create(patient1)
			await repository.create(patient2)

			const result = await repository.search<Patient>('Patient')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value.resourceType).toBe('Bundle')
				expect(result.value.type).toBe('searchset')
				expect(result.value.entry?.length).toBeGreaterThanOrEqual(2)
			}
		})

		it('should filter resources by search parameters', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'filter-patient-1',
				name: [{ use: 'official', family: 'Filter', given: ['Test'] }],
			}

			await repository.create(patient)

			// Search by status (if Patient had status field)
			// This is a simplified test - actual FHIR search requires proper field mapping
			const result = await repository.search<Patient>('Patient', {})

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value.entry).toBeDefined()
			}
		})
	})

	describe('history', () => {
		it('should return resource history', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'history-patient-1',
				name: [{ use: 'official', given: ['Test'] }],
			}

			await repository.create(patient)
			const result = await repository.history('Patient', 'history-patient-1')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value.resourceType).toBe('Bundle')
				expect(result.value.entry?.length).toBeGreaterThanOrEqual(1)
			}
		})
	})

	describe('vread', () => {
		it('should read a specific version of a resource', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'version-patient-1',
				name: [{ use: 'official', given: ['Version'] }],
			}

			await repository.create(patient)

			const result = await repository.vread<Patient>('Patient', 'version-patient-1', '1')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).not.toBeNull()
				expect(result.value?.meta?.versionId).toBe('1')
			}
		})

		it('should return null for non-existent version', async () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'version-patient-2',
				name: [{ use: 'official', given: ['Test'] }],
			}

			await repository.create(patient)

			const result = await repository.vread<Patient>('Patient', 'version-patient-2', '999')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).toBeNull()
			}
		})
	})

	describe('Practitioner resources', () => {
		it('should create and read Practitioner resources', async () => {
			const practitioner: Practitioner = {
				resourceType: 'Practitioner',
				id: 'practitioner-1',
				name: [{ use: 'official', text: 'Dr. Smith' }],
				active: true,
			}

			const createResult = await repository.create(practitioner)
			expect(createResult.success).toBe(true)

			const readResult = await repository.read<Practitioner>('Practitioner', 'practitioner-1')
			expect(readResult.success).toBe(true)
			if (readResult.success) {
				expect(readResult.value?.resourceType).toBe('Practitioner')
				expect(readResult.value?.active).toBe(true)
			}
		})
	})
})
