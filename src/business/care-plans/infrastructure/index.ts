import type { CarePlanRepository } from '@/business/care-plans/domain/CarePlanRepository'
import { createCarePlanRepository as createFirestoreCarePlanRepository } from '@/business/care-plans/infrastructure/FirestoreCarePlanRepository'
import { db } from '@/infrastructure/firebase/firebase.config'

export function createCarePlanRepository(): CarePlanRepository {
	return createFirestoreCarePlanRepository(db)
}
