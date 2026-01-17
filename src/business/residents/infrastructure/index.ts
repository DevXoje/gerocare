import { db } from '@/infrastructure/firebase/firebase.config'
import { createResidentRepository as createFirestoreResidentRepository } from './FirestoreResidentRepository'
import type { ResidentRepository } from '../domain/ResidentRepository'

export function createResidentRepository(): ResidentRepository {
  return createFirestoreResidentRepository(db)
}

