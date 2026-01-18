import type { CarePlanRepository } from '@/business/care-plans/domain/CarePlanRepository'
import { createCarePlanRepository as createFirestoreCarePlanRepository } from '@/business/care-plans/infrastructure/FirestoreCarePlanRepository'
import { db } from '@/infrastructure/firebase/firebase.config'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

export function createCarePlanRepository(): CarePlanRepository {
	const firestoreRepository = createFirestoreCarePlanRepository(db)
	const queue = createOfflineQueueRepository()

	return withOfflineSupport(firestoreRepository, 'care-plan', queue)
}
