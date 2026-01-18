import type { MedicationRepository } from '@/business/medication/domain/MedicationRepository'
import { createMedicationRepository as createFirestoreMedicationRepository } from '@/business/medication/infrastructure/FirestoreMedicationRepository'
import { db } from '@/infrastructure/firebase/firebase.config'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

export function createMedicationRepository(): MedicationRepository {
	const firestoreRepository = createFirestoreMedicationRepository(db)
	const queue = createOfflineQueueRepository()

	return withOfflineSupport(firestoreRepository, 'medication', queue)
}
