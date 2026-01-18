import { db } from '@/infrastructure/firebase/firebase.config'

import type { ResidentRepository } from '../domain/ResidentRepository'

import { createResidentRepository as createFirestoreResidentRepository } from './FirestoreResidentRepository'

export function createResidentRepository(): ResidentRepository {
  return createFirestoreResidentRepository(db)
}

