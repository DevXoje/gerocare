import { db } from '@/infrastructure/firebase/firebase.config'

import type { ActivityLogRepository } from '../domain/ActivityLogRepository'

import { createActivityLogRepository as createFirestoreActivityLogRepository } from './FirestoreActivityLogRepository'

export function createActivityLogRepository(): ActivityLogRepository {
  return createFirestoreActivityLogRepository(db)
}
