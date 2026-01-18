import { db } from '@/infrastructure/firebase/firebase.config'

import type { CarePlanRepository } from '../domain/CarePlanRepository'

import { createCarePlanRepository as createFirestoreCarePlanRepository } from './FirestoreCarePlanRepository'

export function createCarePlanRepository(): CarePlanRepository {
  return createFirestoreCarePlanRepository(db)
}
