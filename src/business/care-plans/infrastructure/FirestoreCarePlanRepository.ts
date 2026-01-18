import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	type Firestore,
	getDoc,
	getDocs,
	orderBy,
	query,
	Timestamp,
	updateDoc,
	where,
} from 'firebase/firestore'

import type { CarePlan, CarePlanActivity } from '@/business/care-plans/domain/CarePlan'
import { CarePlanSchema } from '@/business/care-plans/domain/CarePlan.schema'
import type { CarePlanError } from '@/business/care-plans/domain/CarePlanErrors'
import {
	createCarePlanNotFoundError,
	createCarePlanValidationError,
	createUnknownCarePlanError,
} from '@/business/care-plans/domain/CarePlanErrors'
import type { CarePlanRepository } from '@/business/care-plans/domain/CarePlanRepository'
import { toAppError } from '@/shared/domain/AppError'
import { Err, Ok, type Result } from '@/shared/domain/Result'
import { logError } from '@/shared/error/errorLogger'

type TimestampLike = Timestamp | Date | string | { toDate?: () => Date }

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
function timestampToDate(timestamp: TimestampLike): Date {
	if (timestamp instanceof Timestamp) {
		return timestamp.toDate()
	}
	if (
		timestamp &&
		typeof timestamp === 'object' &&
		'toDate' in timestamp &&
		typeof timestamp.toDate === 'function'
	) {
		return timestamp.toDate()
	}
	if (timestamp instanceof Date) {
		return timestamp
	}
	return new Date(timestamp as string)
}

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
function dateToTimestamp(date: Date): Timestamp {
	return Timestamp.fromDate(date)
}

/**
 * Convert Firestore document to CarePlan entity with Zod validation
 */
function firestoreDocToCarePlan(
	docId: string,
	data: Record<string, unknown>
): Result<CarePlan, CarePlanError> {
	try {
		// Convert Firestore Timestamp to Date
		const carePlanData = {
			id: docId,
			residentId: data.residentId,
			title: data.title,
			description: data.description,
			category: data.category,
			frequency: data.frequency,
			priority: data.priority,
			startDate: timestampToDate(data.startDate as TimestampLike),
			endDate: data.endDate ? timestampToDate(data.endDate as TimestampLike) : undefined,
			status: data.status,
			createdBy: data.createdBy,
			assignedTo: data.assignedTo,
			createdAt: timestampToDate(data.createdAt as TimestampLike),
			updatedAt: timestampToDate(data.updatedAt as TimestampLike),
		}

		// Validate with Zod schema
		const result = CarePlanSchema.safeParse(carePlanData)

		if (!result.success) {
			const firstError = result.error.issues[0]
			return Err(
				createCarePlanValidationError(
					`Invalid care plan data from Firestore: ${firstError?.message || 'Validation failed'}`
				)
			)
		}

		return Ok(result.data)
	} catch (error) {
		const appError = toAppError(error, 'Error al convertir documento de Firestore a CarePlan')
		logError(appError, { docId, operation: 'firestoreDocToCarePlan' })
		return Err(createUnknownCarePlanError(appError.message))
	}
}

/**
 * Convert Firestore document to CarePlanActivity entity
 */
function firestoreDocToActivity(docId: string, data: Record<string, unknown>): CarePlanActivity {
	return {
		id: docId,
		carePlanId: data.carePlanId as string,
		residentId: data.residentId as string,
		activityDate: timestampToDate(data.activityDate as TimestampLike),
		completedBy: data.completedBy as string | undefined,
		completedAt: data.completedAt ? timestampToDate(data.completedAt as TimestampLike) : undefined,
		notes: data.notes as string | undefined,
		status: data.status as 'pending' | 'completed' | 'skipped',
	}
}

export function createCarePlanRepository(db: Firestore): CarePlanRepository {
	const collectionName = 'carePlans'
	const activityCollectionName = 'carePlanActivities'

	async function create(
		carePlan: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Result<CarePlan, CarePlanError>> {
		try {
			const now = new Date()
			const carePlanData = {
				...carePlan,
				startDate: dateToTimestamp(carePlan.startDate),
				endDate: carePlan.endDate ? dateToTimestamp(carePlan.endDate) : null,
				createdAt: dateToTimestamp(now),
				updatedAt: dateToTimestamp(now),
			}

			const docRef = await addDoc(collection(db, collectionName), carePlanData)
			const createdCarePlan: CarePlan = {
				...carePlan,
				id: docRef.id,
				createdAt: now,
				updatedAt: now,
			}

			return Ok(createdCarePlan)
		} catch (error) {
			const appError = toAppError(error, 'Error al crear plan de cuidado')
			logError(appError, { operation: 'create', carePlan })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function findById(id: string): Promise<Result<CarePlan | null, CarePlanError>> {
		try {
			const docRef = doc(db, collectionName, id)
			const docSnap = await getDoc(docRef)

			if (!docSnap.exists()) {
				return Ok(null)
			}

			const docData = docSnap.data()
			if (!docData) {
				return Ok(null)
			}

			const carePlanResult = firestoreDocToCarePlan(docSnap.id, docData)
			if (!carePlanResult.success) {
				return carePlanResult
			}
			return Ok(carePlanResult.value)
		} catch (error) {
			const appError = toAppError(error, 'Error al buscar plan de cuidado')
			logError(appError, { operation: 'findById', id })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function findByResident(residentId: string): Promise<Result<CarePlan[], CarePlanError>> {
		try {
			const q = query(
				collection(db, collectionName),
				where('residentId', '==', residentId),
				orderBy('createdAt', 'desc')
			)
			const querySnapshot = await getDocs(q)
			const carePlanResults = querySnapshot.docs.map(doc =>
				firestoreDocToCarePlan(doc.id, doc.data())
			)

			// Check for validation errors
			const errors = carePlanResults.filter(r => !r.success)
			if (errors.length > 0) {
				return errors[0] as Result<CarePlan[], CarePlanError>
			}

			const carePlans = carePlanResults
				.map(r => (r.success ? r.value : null))
				.filter((c): c is CarePlan => c !== null)
			return Ok(carePlans)
		} catch (error) {
			const appError = toAppError(error, 'Error al buscar planes de cuidado por residente')
			logError(appError, { operation: 'findByResident', residentId })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function findActiveByResident(
		residentId: string
	): Promise<Result<CarePlan[], CarePlanError>> {
		try {
			const q = query(
				collection(db, collectionName),
				where('residentId', '==', residentId),
				where('status', '==', 'active'),
				orderBy('createdAt', 'desc')
			)
			const querySnapshot = await getDocs(q)
			const carePlanResults = querySnapshot.docs.map(doc =>
				firestoreDocToCarePlan(doc.id, doc.data())
			)

			// Check for validation errors
			const errors = carePlanResults.filter(r => !r.success)
			if (errors.length > 0) {
				return errors[0] as Result<CarePlan[], CarePlanError>
			}

			const carePlans = carePlanResults
				.map(r => (r.success ? r.value : null))
				.filter((c): c is CarePlan => c !== null)
			return Ok(carePlans)
		} catch (error) {
			const appError = toAppError(error, 'Error al buscar planes de cuidado activos por residente')
			logError(appError, { operation: 'findActiveByResident', residentId })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function findAll(): Promise<Result<CarePlan[], CarePlanError>> {
		try {
			const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
			const querySnapshot = await getDocs(q)
			const carePlanResults = querySnapshot.docs.map(doc =>
				firestoreDocToCarePlan(doc.id, doc.data())
			)

			// Check for validation errors
			const errors = carePlanResults.filter(r => !r.success)
			if (errors.length > 0) {
				return errors[0] as Result<CarePlan[], CarePlanError>
			}

			const carePlans = carePlanResults
				.map(r => (r.success ? r.value : null))
				.filter((c): c is CarePlan => c !== null)
			return Ok(carePlans)
		} catch (error) {
			const appError = toAppError(error, 'Error al buscar todos los planes de cuidado')
			logError(appError, { operation: 'findAll' })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function update(
		id: string,
		updates: Partial<Omit<CarePlan, 'id' | 'createdAt'>>
	): Promise<Result<CarePlan, CarePlanError>> {
		try {
			const docRef = doc(db, collectionName, id)
			const docSnap = await getDoc(docRef)

			if (!docSnap.exists()) {
				return Err(createCarePlanNotFoundError(`Care plan with id ${id} not found`))
			}

			const updateData: Record<string, unknown> = {
				...updates,
				updatedAt: dateToTimestamp(new Date()),
			}

			// Convert dates if present
			if (updates.startDate) {
				updateData.startDate = dateToTimestamp(updates.startDate)
			}
			if (updates.endDate !== undefined) {
				updateData.endDate = updates.endDate ? dateToTimestamp(updates.endDate) : null
			}

			await updateDoc(docRef, updateData)

			// Fetch updated document
			const updatedDoc = await getDoc(docRef)
			const updatedData = updatedDoc.data()
			if (!updatedData) {
				return Err(createCarePlanNotFoundError(`Care plan with id ${id} not found after update`))
			}
			const carePlanResult = firestoreDocToCarePlan(updatedDoc.id, updatedData)

			if (!carePlanResult.success) {
				return carePlanResult
			}

			return Ok(carePlanResult.value)
		} catch (error) {
			if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
				return Err(createCarePlanNotFoundError(`Plan de cuidado con id ${id} no encontrado`))
			}
			const appError = toAppError(error, 'Error al actualizar plan de cuidado')
			logError(appError, { operation: 'update', id, updates })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function deleteCarePlan(id: string): Promise<Result<void, CarePlanError>> {
		try {
			const docRef = doc(db, collectionName, id)
			const docSnap = await getDoc(docRef)

			if (!docSnap.exists()) {
				return Err(createCarePlanNotFoundError(`Care plan with id ${id} not found`))
			}

			await deleteDoc(docRef)
			return Ok(undefined)
		} catch (error) {
			const appError = toAppError(error, 'Error al eliminar plan de cuidado')
			logError(appError, { operation: 'delete', id })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function recordActivity(
		activity: Omit<CarePlanActivity, 'id'>
	): Promise<Result<CarePlanActivity, CarePlanError>> {
		try {
			const activityData = {
				...activity,
				activityDate: dateToTimestamp(activity.activityDate),
				completedAt: activity.completedAt ? dateToTimestamp(activity.completedAt) : null,
			}

			const docRef = await addDoc(collection(db, activityCollectionName), activityData)
			const createdActivity: CarePlanActivity = {
				...activity,
				id: docRef.id,
			}

			return Ok(createdActivity)
		} catch (error) {
			const appError = toAppError(error, 'Error al registrar actividad del plan de cuidado')
			logError(appError, { operation: 'recordActivity', carePlanId, activity })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function getActivityHistory(
		carePlanId: string
	): Promise<Result<CarePlanActivity[], CarePlanError>> {
		try {
			const q = query(
				collection(db, activityCollectionName),
				where('carePlanId', '==', carePlanId),
				orderBy('activityDate', 'desc')
			)
			const querySnapshot = await getDocs(q)
			const activities = querySnapshot.docs.map(doc => firestoreDocToActivity(doc.id, doc.data()))
			return Ok(activities)
		} catch (error) {
			const appError = toAppError(error, 'Error al obtener historial de actividades')
			logError(appError, { operation: 'getActivityHistory', carePlanId })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	async function getResidentActivityHistory(
		residentId: string
	): Promise<Result<CarePlanActivity[], CarePlanError>> {
		try {
			const q = query(
				collection(db, activityCollectionName),
				where('residentId', '==', residentId),
				orderBy('activityDate', 'desc')
			)
			const querySnapshot = await getDocs(q)
			const activities = querySnapshot.docs.map(doc => firestoreDocToActivity(doc.id, doc.data()))
			return Ok(activities)
		} catch (error) {
			const appError = toAppError(error, 'Error al obtener historial de actividades por residente')
			logError(appError, { operation: 'getResidentActivityHistory', residentId })
			return Err(createUnknownCarePlanError(appError.message))
		}
	}

	return {
		create,
		findById,
		findByResident,
		findActiveByResident,
		findAll,
		update,
		['delete']: deleteCarePlan,
		recordActivity,
		getActivityHistory,
		getResidentActivityHistory,
	}
}
