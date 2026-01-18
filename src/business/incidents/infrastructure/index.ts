import { db } from '@/infrastructure/firebase/firebase.config'

import type { IncidentRepository } from '../domain/IncidentRepository'

import { createIncidentRepository as createFirestoreIncidentRepository } from './FirestoreIncidentRepository'

export function createIncidentRepository(): IncidentRepository {
  return createFirestoreIncidentRepository(db)
}
