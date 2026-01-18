import type { ActivityLogRepository } from '@/business/activity-logs/domain/ActivityLogRepository'
import { createActivityLogRepository as createFirestoreActivityLogRepository } from '@/business/activity-logs/infrastructure/FirestoreActivityLogRepository'
import { db } from '@/infrastructure/firebase/firebase.config'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

export function createActivityLogRepository(): ActivityLogRepository {
	const firestoreRepository = createFirestoreActivityLogRepository(db)
	const queue = createOfflineQueueRepository()

	return withOfflineSupport(firestoreRepository, 'activity-log', queue)
}
