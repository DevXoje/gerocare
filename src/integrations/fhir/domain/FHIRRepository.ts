import type { Bundle, Resource } from 'fhir/r4'

import type { FHIRError } from '@/integrations/fhir/domain/FHIRErrors'
import type { Result } from '@/shared/domain/Result'

/**
 * Interface abstracta para repositorios FHIR
 * Permite migrar de Firestore a GCP Healthcare API sin cambiar la lógica de negocio
 */
export interface FHIRRepository {
	/**
	 * Create a new FHIR resource
	 */
	create<T extends Resource>(resource: T): Promise<Result<T, FHIRError>>

	/**
	 * Read a FHIR resource by type and id
	 */
	read<T extends Resource>(
		resourceType: string,
		id: string
	): Promise<Result<T | null, FHIRError>>

	/**
	 * Update an existing FHIR resource
	 */
	update<T extends Resource>(resource: T): Promise<Result<T, FHIRError>>

	/**
	 * Delete a FHIR resource (soft delete by setting meta)
	 */
	delete(resourceType: string, id: string): Promise<Result<void, FHIRError>>

	/**
	 * Search for FHIR resources using FHIR search parameters
	 * @param resourceType - The type of resource to search (e.g., "Patient")
	 * @param params - FHIR search parameters (e.g., { patient: "Patient/123", status: "active" })
	 */
	search<T extends Resource>(
		resourceType: string,
		params?: Record<string, string>
	): Promise<Result<Bundle<T>, FHIRError>>

	/**
	 * Get version history for a resource
	 */
	history(resourceType: string, id: string): Promise<Result<Bundle, FHIRError>>

	/**
	 * Read a specific version of a resource
	 */
	vread<T extends Resource>(
		resourceType: string,
		id: string,
		versionId: string
	): Promise<Result<T | null, FHIRError>>
}
