import type { Resource } from 'fhir/r4'

/**
 * Helper type for FHIR resources with type safety
 */
export type FHIRResource = Resource

/**
 * Helper type for specific resource types
 */
export type ResourceType = FHIRResource['resourceType']

/**
 * Generate a FHIR-compatible ID
 */
export function generateFHIRId(): string {
	return `fhir-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Enrich a FHIR resource with metadata (versionId, lastUpdated)
 */
export function enrichFHIRResource<T extends Resource>(resource: T): T {
	const now = new Date().toISOString()

	return {
		...resource,
		id: resource.id || generateFHIRId(),
		meta: {
			versionId: '1',
			lastUpdated: now,
			...(resource.meta || {}),
		},
	} as T
}

/**
 * Create a FHIR reference string
 */
export function createReference(resourceType: string, id: string): string {
	return `${resourceType}/${id}`
}

/**
 * Parse a FHIR reference string
 */
export function parseReference(reference: string): { resourceType: string; id: string } | null {
	const match = reference.match(/^(\w+)\/(.+)$/)
	if (!match) return null

	return {
		resourceType: match[1],
		id: match[2],
	}
}
