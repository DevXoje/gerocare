import type { Patient } from 'fhir/r4'
import { describe, expect, it } from 'vitest'

import {
	createReference,
	enrichFHIRResource,
	generateFHIRId,
	parseReference,
} from '../FHIRResource'

describe('FHIRResource helpers', () => {
	describe('generateFHIRId', () => {
		it('should generate a unique FHIR ID', () => {
			const id1 = generateFHIRId()
			const id2 = generateFHIRId()

			expect(id1).toBeDefined()
			expect(id2).toBeDefined()
			expect(id1).not.toBe(id2)
			expect(id1).toMatch(/^fhir-/)
			expect(id2).toMatch(/^fhir-/)
		})
	})

	describe('enrichFHIRResource', () => {
		it('should add metadata to a FHIR resource', () => {
			const patient: Patient = {
				resourceType: 'Patient',
				name: [{ use: 'official', given: ['Test'] }],
			}

			const enriched = enrichFHIRResource(patient)

			expect(enriched.id).toBeDefined()
			expect(enriched.meta?.versionId).toBe('1')
			expect(enriched.meta?.lastUpdated).toBeDefined()
		})

		it('should preserve existing ID', () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'custom-id-123',
				name: [{ use: 'official', given: ['Test'] }],
			}

			const enriched = enrichFHIRResource(patient)

			expect(enriched.id).toBe('custom-id-123')
		})

		it('should override versionId and lastUpdated but preserve other meta fields', () => {
			const patient: Patient = {
				resourceType: 'Patient',
				id: 'patient-1',
				meta: {
					versionId: '5',
					lastUpdated: '2024-01-01T00:00:00Z',
					tag: [
						{
							system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
							code: 'SUPERSEDED',
						},
					],
				},
				name: [{ use: 'official', given: ['Test'] }],
			}

			const enriched = enrichFHIRResource(patient)

			// versionId and lastUpdated are overridden
			expect(enriched.meta?.versionId).toBe('1')
			expect(enriched.meta?.lastUpdated).toBeDefined()
			expect(enriched.meta?.lastUpdated).not.toBe('2024-01-01T00:00:00Z')
			// Other meta fields are preserved
			expect(enriched.meta?.tag).toBeDefined()
			expect(enriched.meta?.tag?.[0]?.code).toBe('SUPERSEDED')
		})

		it('should generate ID if not provided', () => {
			const patient: Patient = {
				resourceType: 'Patient',
				name: [{ use: 'official', given: ['Test'] }],
			}

			const enriched = enrichFHIRResource(patient)

			expect(enriched.id).toBeDefined()
			expect(enriched.id).toMatch(/^fhir-/)
		})
	})

	describe('createReference', () => {
		it('should create a FHIR reference string', () => {
			const reference = createReference('Patient', 'patient-123')

			expect(reference).toBe('Patient/patient-123')
		})

		it('should handle different resource types', () => {
			expect(createReference('Practitioner', 'practitioner-1')).toBe('Practitioner/practitioner-1')
			expect(createReference('Observation', 'obs-456')).toBe('Observation/obs-456')
		})
	})

	describe('parseReference', () => {
		it('should parse a FHIR reference string', () => {
			const parsed = parseReference('Patient/patient-123')

			expect(parsed).not.toBeNull()
			expect(parsed?.resourceType).toBe('Patient')
			expect(parsed?.id).toBe('patient-123')
		})

		it('should return null for invalid reference format', () => {
			expect(parseReference('invalid')).toBeNull()
			expect(parseReference('')).toBeNull()
			expect(parseReference('Patient')).toBeNull() // Missing ID
		})

		it('should handle different resource types', () => {
			const practitionerRef = parseReference('Practitioner/practitioner-1')
			expect(practitionerRef?.resourceType).toBe('Practitioner')
			expect(practitionerRef?.id).toBe('practitioner-1')

			const observationRef = parseReference('Observation/obs-456')
			expect(observationRef?.resourceType).toBe('Observation')
			expect(observationRef?.id).toBe('obs-456')
		})

		it('should handle references with special characters in ID', () => {
			const parsed = parseReference('Patient/patient_123-abc')

			expect(parsed).not.toBeNull()
			expect(parsed?.id).toBe('patient_123-abc')
		})
	})
})
