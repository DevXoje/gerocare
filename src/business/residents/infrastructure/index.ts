import type { ResidentRepository } from '@/business/residents/domain/ResidentRepository'
import { createResidentRepository as createFirestoreResidentRepository } from '@/business/residents/infrastructure/FirestoreResidentRepository'
import { db } from '@/infrastructure/firebase/firebase.config'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

export function createResidentRepository(): ResidentRepository {
	const firestoreRepository = createFirestoreResidentRepository(db)
	const queue = createOfflineQueueRepository()

	return withOfflineSupport(firestoreRepository, 'resident', queue)
}
