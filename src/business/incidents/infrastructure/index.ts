import type { IncidentRepository } from '@/business/incidents/domain/IncidentRepository'
import { createIncidentRepository as createFirestoreIncidentRepository } from '@/business/incidents/infrastructure/FirestoreIncidentRepository'
import { db } from '@/infrastructure/firebase/firebase.config'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

export function createIncidentRepository(): IncidentRepository {
	const firestoreRepository = createFirestoreIncidentRepository(db)
	const queue = createOfflineQueueRepository()

	return withOfflineSupport(firestoreRepository, 'incident', queue)
}
