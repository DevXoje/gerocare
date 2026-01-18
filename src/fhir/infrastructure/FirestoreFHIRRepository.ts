import type { Bundle, Resource } from 'fhir/r4'
import {
	collection,
	doc,
	type Firestore,
	getDoc,
	getDocs,
	query,
	setDoc,
	updateDoc,
	where,
} from 'firebase/firestore'

import type { FHIRError } from '@/fhir/domain/FHIRErrors'
import {
	createFHIRNotFoundError,
	createFHIRSearchError,
	createFHIRValidationError,
	createUnknownFHIRError,
} from '@/fhir/domain/FHIRErrors'
import type { FHIRRepository } from '@/fhir/domain/FHIRRepository'
import { enrichFHIRResource } from '@/fhir/domain/FHIRResource'
import { Err, Ok, type Result } from '@/shared/domain/Result'

const FHIR_COLLECTION = 'fhir'

/**
 * Map FHIR search parameters to Firestore queries
 * This is a simplified mapping - full FHIR search requires more complex logic
 */
function mapFHIRParamToFirestore(param: string): string {
	// Map common FHIR search parameters to Firestore field paths
	const paramMap: Record<string, string> = {
		patient: 'subject.reference',
		subject: 'subject.reference',
		status: 'status',
		category: 'category.coding.code',
		date: 'effectiveDateTime',
	}

	return paramMap[param] || param
}

/**
 * Create a Bundle from an array of resources
 */
function createBundle<T extends Resource>(
	resources: T[],
	total?: number
): Bundle<T> {
	return {
		resourceType: 'Bundle',
		type: 'searchset',
		total: total ?? resources.length,
		entry: resources.map((resource) => ({
			fullUrl: `${resource.resourceType}/${resource.id}`,
			resource,
		})),
	}
}

/**
 * Implementation of FHIRRepository using Firestore
 */
export function createFirestoreFHIRRepository(db: Firestore): FHIRRepository {
	async function create<T extends Resource>(resource: T): Promise<Result<T, FHIRError>> {
		try {
			const enrichedResource = enrichFHIRResource(resource)
			const resourceType = enrichedResource.resourceType
			const id = enrichedResource.id!

			const docRef = doc(db, FHIR_COLLECTION, resourceType, id)
			await setDoc(docRef, enrichedResource)

			return Ok(enrichedResource as T)
		} catch {
			return Err(createUnknownFHIRError(`Failed to create ${resource.resourceType}`))
		}
	}

	async function read<T extends Resource>(
		resourceType: string,
		id: string
	): Promise<Result<T | null, FHIRError>> {
		try {
			const docRef = doc(db, FHIR_COLLECTION, resourceType, id)
			const snapshot = await getDoc(docRef)

			if (!snapshot.exists()) {
				return Ok(null)
			}

			return Ok(snapshot.data() as T)
		} catch {
			return Err(createUnknownFHIRError(`Failed to read ${resourceType}/${id}`))
		}
	}

	async function update<T extends Resource>(resource: T): Promise<Result<T, FHIRError>> {
		try {
			const resourceType = resource.resourceType
			const id = resource.id

			if (!id) {
				return Err(createFHIRValidationError('Resource ID is required for update'))
			}

			// Check if resource exists
			const existingResult = await read(resourceType, id)
			if (!existingResult.success) {
				return existingResult
			}
			if (!existingResult.value) {
				return Err(createFHIRNotFoundError(resourceType, id))
			}

			// Increment version
			const currentVersion = parseInt(
				(existingResult.value.meta?.versionId || '1'),
				10
			)
			const updatedResource: T = {
				...resource,
				meta: {
					...resource.meta,
					versionId: String(currentVersion + 1),
					lastUpdated: new Date().toISOString(),
				},
			}

			const docRef = doc(db, FHIR_COLLECTION, resourceType, id)
			await updateDoc(docRef, updatedResource as Record<string, unknown>)

			return Ok(updatedResource)
		} catch {
			return Err(createUnknownFHIRError(`Failed to update ${resource.resourceType}`))
		}
	}

	async function deleteResource(
		resourceType: string,
		id: string
	): Promise<Result<void, FHIRError>> {
		try {
			const docRef = doc(db, FHIR_COLLECTION, resourceType, id)

			// Soft delete: mark as deleted in meta
			await updateDoc(docRef, {
				'meta.lastUpdated': new Date().toISOString(),
				'meta.tag': [
					{
						system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
						code: 'SUPERSEDED',
						display: 'Superseded',
					},
				],
			})

			return Ok(undefined)
		} catch {
			return Err(createUnknownFHIRError(`Failed to delete ${resourceType}/${id}`))
		}
	}

	async function search<T extends Resource>(
		resourceType: string,
		params: Record<string, string> = {}
	): Promise<Result<Bundle<T>, FHIRError>> {
		try {
			const collRef = collection(db, FHIR_COLLECTION, resourceType)
			let q = query(collRef)

			// Apply search parameters (simplified - only supports equality)
			for (const [key, value] of Object.entries(params)) {
				const firestorePath = mapFHIRParamToFirestore(key)
				q = query(q, where(firestorePath, '==', value))
			}

			const snapshot = await getDocs(q)
			const resources = snapshot.docs.map((doc) => doc.data() as T)

			return Ok(createBundle(resources))
		} catch {
			return Err(createFHIRSearchError(`Failed to search ${resourceType}`, { params }))
		}
	}

	async function history(
		resourceType: string,
		id: string
	): Promise<Result<Bundle, FHIRError>> {
		try {
			// In Firestore MVP, we don't have automatic versioning
			// This would require a separate collection for versions
			// For now, return the current version as history
			const result = await read(resourceType, id)
			if (!result.success || !result.value) {
				return Err(createFHIRNotFoundError(resourceType, id))
			}

			return Ok(createBundle([result.value]))
		} catch {
			return Err(createUnknownFHIRError(`Failed to get history for ${resourceType}/${id}`))
		}
	}

	async function vread<T extends Resource>(
		resourceType: string,
		id: string,
		versionId: string
	): Promise<Result<T | null, FHIRError>> {
		try {
			// In Firestore MVP, versioning is manual via meta.versionId
			// For now, just read the current version
			const result = await read<T>(resourceType, id)
			if (!result.success) {
				return result
			}

			if (result.value?.meta?.versionId === versionId) {
				return Ok(result.value)
			}

			return Ok(null)
		} catch {
			return Err(createUnknownFHIRError(`Failed to read version ${versionId} of ${resourceType}/${id}`))
		}
	}

	return {
		create,
		read,
		update,
		delete: deleteResource,
		search,
		history,
		vread,
	}
}
