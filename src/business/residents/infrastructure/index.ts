import type { ResidentRepository } from '@/business/residents/domain/ResidentRepository'
import { createResidentRepository as createFirestoreResidentRepository } from '@/business/residents/infrastructure/FirestoreResidentRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

export function createResidentRepository(): ResidentRepository {
	return createFirestoreResidentRepository(db)
}
