import type { MedicationRepository } from '@/business/medication/domain/MedicationRepository'
import { createMedicationRepository as createFirestoreMedicationRepository } from '@/business/medication/infrastructure/FirestoreMedicationRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

export function createMedicationRepository(): MedicationRepository {
	return createFirestoreMedicationRepository(db)
}
