import { db } from '@/infrastructure/firebase/firebase.config'

import type { ShiftRepository } from '../domain/ShiftRepository'

import { createShiftRepository as createFirestoreShiftRepository } from './FirestoreShiftRepository'

export function createShiftRepository(): ShiftRepository {
  return createFirestoreShiftRepository(db)
}
