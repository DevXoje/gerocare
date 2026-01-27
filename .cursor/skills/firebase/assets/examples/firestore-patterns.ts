/**
 * Firestore Patterns - Example Code
 * 
 * These are reference examples showing Firestore repository patterns used in GeroCare.
 * See SKILL.md for detailed explanations.
 */

import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	type Firestore,
	getDoc,
	getDocs,
	query,
	Timestamp,
	updateDoc,
	where,
} from 'firebase/firestore'

import type { Entity } from '@/business/{feature}/domain/Entity'
import { EntitySchema } from '@/business/{feature}/domain/Entity.schema'
import type { EntityError } from '@/business/{feature}/domain/EntityErrors'
import {
	createEntityNotFoundError,
	createEntityValidationError,
	createUnknownEntityError,
} from '@/business/{feature}/domain/EntityErrors'
import type { EntityRepository } from '@/business/{feature}/domain/EntityRepository'
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
 * Convert Firestore document to domain entity with Zod validation
 */
function firestoreDocToEntity(
	docId: string,
	data: Record<string, unknown>
): Result<Entity, EntityError> {
	try {
		// Convert Firestore Timestamp to Date
		const entityData = {
			id: docId,
			...data,
			dateOfBirth: timestampToDate(data.dateOfBirth as TimestampLike),
			createdAt: timestampToDate(data.createdAt as TimestampLike),
			updatedAt: timestampToDate(data.updatedAt as TimestampLike),
		}

		// Validate with Zod schema
		const result = EntitySchema.safeParse(entityData)

		if (!result.success) {
			const firstError = result.error.issues[0]
			return Err(
				createEntityValidationError(
					`Invalid entity data from Firestore: ${firstError?.message || 'Validation failed'}`
				)
			)
		}

		return Ok(result.data)
	} catch (error) {
		const appError = toAppError(error, 'Error al convertir documento de Firestore a Entity')
		logError(appError, { docId, operation: 'firestoreDocToEntity' })
		return Err(createUnknownEntityError(appError.message))
	}
}

/**
 * Example: Create Firestore repository
 */
export function createEntityRepository(db: Firestore): EntityRepository {
	const collectionName = 'entities'

	/**
	 * Example: Create entity
	 */
	async function create(
		entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Result<Entity, EntityError>> {
		try {
			const now = new Date()
			const entityData = {
				...entity,
				dateOfBirth: dateToTimestamp(entity.dateOfBirth),
				createdAt: dateToTimestamp(now),
				updatedAt: dateToTimestamp(now),
			}

			const docRef = await addDoc(collection(db, collectionName), entityData)
			const createdEntity: Entity = {
				...entity,
				id: docRef.id,
				createdAt: now,
				updatedAt: now,
			}

			return Ok(createdEntity)
		} catch (error) {
			const appError = toAppError(error, 'Error al crear entity')
			logError(appError, { operation: 'create', entity })
			return Err(createUnknownEntityError(appError.message))
		}
	}

	/**
	 * Example: Find by ID
	 */
	async function findById(id: string): Promise<Result<Entity | null, EntityError>> {
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

			return firestoreDocToEntity(docSnap.id, docData)
		} catch (error) {
			const appError = toAppError(error, 'Error al buscar entity')
			logError(appError, { operation: 'findById', id })
			return Err(createUnknownEntityError(appError.message))
		}
	}

	/**
	 * Example: Find all entities
	 */
	async function findAll(): Promise<Result<Entity[], EntityError>> {
		try {
			const querySnapshot = await getDocs(collection(db, collectionName))
			const results = querySnapshot.docs.map(doc =>
				firestoreDocToEntity(doc.id, doc.data())
			)

			// Check for validation errors
			const errors = results.filter(r => !r.success)
			if (errors.length > 0) {
				return errors[0] as Result<Entity[], EntityError>
			}

			const entities = results
				.map(r => (r.success ? r.value : null))
				.filter((r): r is Entity => r !== null)
			return Ok(entities)
		} catch (error) {
			const appError = toAppError(error, 'Error al buscar todos los entities')
			logError(appError, { operation: 'findAll' })
			return Err(createUnknownEntityError(appError.message))
		}
	}

	/**
	 * Example: Query with where clause
	 */
	async function findByField(field: string, value: string): Promise<Result<Entity[], EntityError>> {
		try {
			const q = query(collection(db, collectionName), where(field, '==', value))
			const querySnapshot = await getDocs(q)
			const results = querySnapshot.docs.map(doc =>
				firestoreDocToEntity(doc.id, doc.data())
			)

			// Check for validation errors
			const errors = results.filter(r => !r.success)
			if (errors.length > 0) {
				return errors[0] as Result<Entity[], EntityError>
			}

			const entities = results
				.map(r => (r.success ? r.value : null))
				.filter((r): r is Entity => r !== null)
			return Ok(entities)
		} catch (error) {
			const appError = toAppError(error, `Error al buscar entities por ${field}`)
			logError(appError, { operation: 'findByField', field, value })
			return Err(createUnknownEntityError(appError.message))
		}
	}

	/**
	 * Example: Update entity
	 */
	async function update(
		id: string,
		updates: Partial<Omit<Entity, 'id' | 'createdAt'>>
	): Promise<Result<Entity, EntityError>> {
		try {
			const docRef = doc(db, collectionName, id)
			const docSnap = await getDoc(docRef)

			if (!docSnap.exists()) {
				return Err(createEntityNotFoundError(`Entity with id ${id} not found`))
			}

			const updateData: Record<string, unknown> = {
				...updates,
				updatedAt: dateToTimestamp(new Date()),
			}

			// Convert dateOfBirth if present
			if (updates.dateOfBirth) {
				updateData.dateOfBirth = dateToTimestamp(updates.dateOfBirth)
			}

			await updateDoc(docRef, updateData)

			// Fetch updated document
			const updatedDoc = await getDoc(docRef)
			const updatedData = updatedDoc.data()
			if (!updatedData) {
				return Err(createEntityNotFoundError(`Entity with id ${id} not found after update`))
			}

			return firestoreDocToEntity(updatedDoc.id, updatedData)
		} catch (error) {
			const appError = toAppError(error, 'Error al actualizar entity')
			logError(appError, { operation: 'update', id, updates })
			return Err(createUnknownEntityError(appError.message))
		}
	}

	/**
	 * Example: Delete entity
	 */
	async function deleteEntity(id: string): Promise<Result<void, EntityError>> {
		try {
			const docRef = doc(db, collectionName, id)
			const docSnap = await getDoc(docRef)

			if (!docSnap.exists()) {
				return Err(createEntityNotFoundError(`Entity with id ${id} not found`))
			}

			await deleteDoc(docRef)
			return Ok(undefined)
		} catch (error) {
			const appError = toAppError(error, 'Error al eliminar entity')
			logError(appError, { operation: 'delete', id })
			return Err(createUnknownEntityError(appError.message))
		}
	}

	return {
		create,
		findById,
		findAll,
		findByField,
		update,
		delete: deleteEntity,
	}
}
