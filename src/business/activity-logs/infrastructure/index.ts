import type { ActivityLogRepository } from '@/business/activity-logs/domain/ActivityLogRepository'
import { createActivityLogRepository as createFirestoreActivityLogRepository } from '@/business/activity-logs/infrastructure/FirestoreActivityLogRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

export function createActivityLogRepository(): ActivityLogRepository {
	return createFirestoreActivityLogRepository(db)
}
