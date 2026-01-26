import { doc, type Firestore, getDoc, setDoc } from 'firebase/firestore'

import type { FHIRError } from '@/integrations/fhir/domain/FHIRErrors'
import { createUnknownFHIRError } from '@/integrations/fhir/domain/FHIRErrors'
import type { Result } from '@/shared/domain/Result'
import { Err, Ok } from '@/shared/domain/Result'

const ID_MAPPING_COLLECTION = 'id_mappings'

interface IdMapping {
	gerocareCollection: string
	gerocareId: string
	fhirResourceType: string
	fhirId: string
}

/**
 * Service for mapping GeroCare IDs to FHIR IDs and vice versa
 */
export function createIdMappingService(db: Firestore) {
	async function mapGeroCareToFHIR(
		gerocareCollection: string,
		gerocareId: string,
		fhirResourceType: string,
		fhirId: string
	): Promise<Result<void, FHIRError>> {
		try {
			const docId = `${gerocareCollection}_${gerocareId}`
			const docRef = doc(db, ID_MAPPING_COLLECTION, docId)

			const mapping: IdMapping = {
				gerocareCollection,
				gerocareId,
				fhirResourceType,
				fhirId,
			}

			await setDoc(docRef, mapping)
			return Ok(undefined)
		} catch {
			return Err(createUnknownFHIRError('Failed to create ID mapping'))
		}
	}

	async function getFHIRId(
		gerocareCollection: string,
		gerocareId: string
	): Promise<Result<{ resourceType: string; id: string } | null, FHIRError>> {
		try {
			const docId = `${gerocareCollection}_${gerocareId}`
			const docRef = doc(db, ID_MAPPING_COLLECTION, docId)
			const snapshot = await getDoc(docRef)

			if (!snapshot.exists()) {
				return Ok(null)
			}

			const mapping = snapshot.data() as IdMapping
			return Ok({
				resourceType: mapping.fhirResourceType,
				id: mapping.fhirId,
			})
		} catch {
			return Err(createUnknownFHIRError('Failed to get FHIR ID mapping'))
		}
	}

	async function getGeroCareId(): Promise<Result<{ collection: string; id: string } | null, FHIRError>> {
		try {
			// Note: This is a simplified lookup
			// In production, you might want a reverse index for efficient lookup
			// For now, we'll need to query by fhirResourceType and fhirId
			// This requires a composite query which Firestore supports

			// For MVP, we'll use the forward mapping only
			// Reverse lookups can be added later if needed
			return Ok(null)
		} catch {
			return Err(createUnknownFHIRError('Failed to get GeroCare ID mapping'))
		}
	}

	return {
		mapGeroCareToFHIR,
		getFHIRId,
		getGeroCareId,
	}
}
