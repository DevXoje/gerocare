import { beforeEach, describe, expect, it } from 'vitest'

import { testDb } from '@/test/setup'

import { createIdMappingService } from '../IdMappingService'

describe('IdMappingService', () => {
	let mappingService: ReturnType<typeof createIdMappingService>

	beforeEach(() => {
		mappingService = createIdMappingService(testDb)
	})

	describe('mapGeroCareToFHIR', () => {
		it('should create a mapping from GeroCare ID to FHIR ID', async () => {
			const result = await mappingService.mapGeroCareToFHIR(
				'residents',
				'resident-123',
				'Patient',
				'patient-fhir-456'
			)

			expect(result.success).toBe(true)
		})
	})

	describe('getFHIRId', () => {
		it('should retrieve FHIR ID from GeroCare mapping', async () => {
			await mappingService.mapGeroCareToFHIR('residents', 'resident-1', 'Patient', 'patient-1')

			const result = await mappingService.getFHIRId('residents', 'resident-1')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).not.toBeNull()
				expect(result.value?.resourceType).toBe('Patient')
				expect(result.value?.id).toBe('patient-1')
			}
		})

		it('should return null for non-existent mapping', async () => {
			const result = await mappingService.getFHIRId('residents', 'non-existent')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).toBeNull()
			}
		})

		it('should handle different GeroCare collections', async () => {
			await mappingService.mapGeroCareToFHIR('users', 'user-1', 'Practitioner', 'practitioner-1')

			const result = await mappingService.getFHIRId('users', 'user-1')

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value?.resourceType).toBe('Practitioner')
				expect(result.value?.id).toBe('practitioner-1')
			}
		})
	})

	describe('getGeroCareId', () => {
		it('should return null (not implemented yet)', async () => {
			const result = await mappingService.getGeroCareId()

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.value).toBeNull()
			}
		})
	})
})
