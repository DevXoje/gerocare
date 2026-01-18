import type { ShiftRepository } from '@/business/shifts/domain/ShiftRepository'
import { createShiftRepository as createFirestoreShiftRepository } from '@/business/shifts/infrastructure/FirestoreShiftRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

export function createShiftRepository(): ShiftRepository {
	return createFirestoreShiftRepository(db)
}
