import type { ShiftRepository } from '@/business/shifts/domain/ShiftRepository'
import { createShiftRepository as createFirestoreShiftRepository } from '@/business/shifts/infrastructure/FirestoreShiftRepository'
import { db } from '@/infrastructure/firebase/firebase.config'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

export function createShiftRepository(): ShiftRepository {
	const firestoreRepository = createFirestoreShiftRepository(db)
	const queue = createOfflineQueueRepository()

	return withOfflineSupport(firestoreRepository, 'shift', queue)
}
