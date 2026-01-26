import type { FHIRRepository } from '@/integrations/fhir/domain/FHIRRepository'

/**
 * Stub for future GCP Healthcare API implementation
 * This file is prepared for migration but not yet implemented
 *
 * To implement:
 * 1. Install @googleapis/healthcare: npm install @googleapis/healthcare
 * 2. Configure credentials (Application Default Credentials or service account)
 * 3. Implement all FHIRRepository methods using Healthcare API client
 * 4. Update createFHIRRepository() in infrastructure/index.ts
 *
 * Example implementation structure:
 *
 * import { healthcare_v1 } from '@googleapis/healthcare'
 *
 * export function createHealthcareAPIRepository(
 *   projectId: string,
 *   location: string,
 *   datasetId: string,
 *   fhirStoreId: string
 * ): FHIRRepository {
 *   const healthcare = new healthcare_v1.Healthcare({})
 *   const parent = `projects/${projectId}/locations/${location}/datasets/${datasetId}/fhirStores/${fhirStoreId}`
 *
 *   async function create<T extends Resource>(resource: T): Promise<Result<T, FHIRErrors>> {
 *     try {
 *       const response = await healthcare.projects.locations.datasets.fhirStores.fhir.create({
 *         parent,
 *         type: resource.resourceType,
 *         requestBody: resource,
 *       })
 *       return Ok(response.data as T)
 *     } catch (error) {
 *       return Err(createUnknownFHIRError('Failed to create resource'))
 *     }
 *   }
 *
 *   // ... implement other methods
 *
 *   return { create, read, update, delete, search, history, vread }
 * }
 */
export function createHealthcareAPIRepository(): FHIRRepository {
	throw new Error('GCP Healthcare API implementation not yet available')
}
