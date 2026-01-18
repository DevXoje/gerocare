import type { FHIRRepository } from '@/fhir/domain/FHIRRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

import { createFirestoreFHIRRepository } from './FirestoreFHIRRepository'
import { createIdMappingService } from './IdMappingService'

/**
 * Factory function to create FHIRRepository instance
 * Uses environment variable VITE_FHIR_BACKEND to choose implementation:
 * - 'firestore' (default): Uses Firestore
 * - 'healthcare-api': Uses GCP Healthcare API (future implementation)
 */
export function createFHIRRepository(): FHIRRepository {
	const backend = import.meta.env.VITE_FHIR_BACKEND || 'firestore'

	switch (backend) {
		case 'healthcare-api':
			// Future: return createHealthcareAPIRepository(...)
			throw new Error('GCP Healthcare API implementation not yet available')
		case 'firestore':
		default:
			return createFirestoreFHIRRepository(db)
	}
}

/**
 * Factory function to create IdMappingService instance
 */
export function createIdMapping(): ReturnType<typeof createIdMappingService> {
	return createIdMappingService(db)
}
