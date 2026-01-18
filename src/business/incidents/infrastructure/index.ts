import type { IncidentRepository } from '@/business/incidents/domain/IncidentRepository'
import { createIncidentRepository as createFirestoreIncidentRepository } from '@/business/incidents/infrastructure/FirestoreIncidentRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

export function createIncidentRepository(): IncidentRepository {
	return createFirestoreIncidentRepository(db)
}
