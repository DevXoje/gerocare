import { db } from '@/infrastructure/firebase/firebase.config'

import type { MedicationRepository } from '../domain/MedicationRepository'

import { createMedicationRepository as createFirestoreMedicationRepository } from './FirestoreMedicationRepository'

export function createMedicationRepository(): MedicationRepository {
  return createFirestoreMedicationRepository(db)
}
