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

import { Err, Ok, type Result } from '@/shared/domain/Result'

import type { ActivityLog } from '../domain/ActivityLog'
import { ActivityLogSchema } from '../domain/ActivityLog.schema'
import type { ActivityLogError } from '../domain/ActivityLogErrors'
import {
  createActivityLogNotFoundError,
  createActivityLogRepositoryError,
  createActivityLogValidationError,
} from '../domain/ActivityLogErrors'
import type { ActivityLogRepository } from '../domain/ActivityLogRepository'

type TimestampLike = Timestamp | Date | string | { toDate?: () => Date }

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
function timestampToDate(timestamp: TimestampLike): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
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
 * Convert Firestore document to ActivityLog entity with Zod validation
 */
function firestoreDocToActivityLog(docId: string, data: Record<string, unknown>): Result<ActivityLog, ActivityLogError> {
  try {
    // Convert Firestore Timestamp to Date
    const activityLogData = {
      id: docId,
      residentId: data.residentId,
      caregiverId: data.caregiverId,
      activityType: data.activityType,
      title: data.title,
      description: data.description,
      timestamp: timestampToDate(data.timestamp as TimestampLike),
      duration: data.duration,
      notes: data.notes,
      photos: data.photos,
      status: data.status,
      createdAt: timestampToDate(data.createdAt as TimestampLike),
    }

    // Validate with Zod schema
    const result = ActivityLogSchema.safeParse(activityLogData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return Err(createActivityLogValidationError(`Invalid activity log data from Firestore: ${firstError?.message || 'Validation failed'}`))
    }

    return Ok(result.data)
  } catch (error) {
    return Err(createActivityLogRepositoryError('Failed to convert Firestore document to ActivityLog'))
  }
}

export function createActivityLogRepository(db: Firestore): ActivityLogRepository {
  const collectionName = 'activityLogs'

  async function create(activityLog: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<Result<ActivityLog, ActivityLogError>> {
    try {
      const now = new Date()
      const activityLogData = {
        ...activityLog,
        timestamp: dateToTimestamp(activityLog.timestamp),
        createdAt: dateToTimestamp(now),
      }

      const docRef = await addDoc(collection(db, collectionName), activityLogData)
      const createdActivityLog: ActivityLog = {
        ...activityLog,
        id: docRef.id,
        createdAt: now,
      }

      return Ok(createdActivityLog)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create activity log'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function findById(id: string): Promise<Result<ActivityLog | null, ActivityLogError>> {
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

      const activityLogResult = firestoreDocToActivityLog(docSnap.id, docData)
      if (!activityLogResult.success) {
        return activityLogResult
      }
      return Ok(activityLogResult.value)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find activity log'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function findByResident(residentId: string): Promise<Result<ActivityLog[], ActivityLogError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('residentId', '==', residentId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const activityLogResults = querySnapshot.docs.map((doc) => firestoreDocToActivityLog(doc.id, doc.data()))

      // Check for validation errors
      const errors = activityLogResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<ActivityLog[], ActivityLogError>
      }

      const activityLogs = activityLogResults.map((r) => (r.success ? r.value : null)).filter((c): c is ActivityLog => c !== null)
      return Ok(activityLogs)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find activity logs by resident'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function findByCaregiver(caregiverId: string): Promise<Result<ActivityLog[], ActivityLogError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('caregiverId', '==', caregiverId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const activityLogResults = querySnapshot.docs.map((doc) => firestoreDocToActivityLog(doc.id, doc.data()))

      // Check for validation errors
      const errors = activityLogResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<ActivityLog[], ActivityLogError>
      }

      const activityLogs = activityLogResults.map((r) => (r.success ? r.value : null)).filter((c): c is ActivityLog => c !== null)
      return Ok(activityLogs)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find activity logs by caregiver'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function findByResidentAndDateRange(
    residentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<ActivityLog[], ActivityLogError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('residentId', '==', residentId),
        where('timestamp', '>=', dateToTimestamp(startDate)),
        where('timestamp', '<=', dateToTimestamp(endDate)),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const activityLogResults = querySnapshot.docs.map((doc) => firestoreDocToActivityLog(doc.id, doc.data()))

      // Check for validation errors
      const errors = activityLogResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<ActivityLog[], ActivityLogError>
      }

      const activityLogs = activityLogResults.map((r) => (r.success ? r.value : null)).filter((c): c is ActivityLog => c !== null)
      return Ok(activityLogs)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find activity logs by resident and date range'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function findAll(): Promise<Result<ActivityLog[], ActivityLogError>> {
    try {
      const q = query(collection(db, collectionName), orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      const activityLogResults = querySnapshot.docs.map((doc) => firestoreDocToActivityLog(doc.id, doc.data()))

      // Check for validation errors
      const errors = activityLogResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<ActivityLog[], ActivityLogError>
      }

      const activityLogs = activityLogResults.map((r) => (r.success ? r.value : null)).filter((c): c is ActivityLog => c !== null)
      return Ok(activityLogs)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find activity logs'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function update(
    id: string,
    updates: Partial<Omit<ActivityLog, 'id' | 'createdAt'>>
  ): Promise<Result<ActivityLog, ActivityLogError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createActivityLogNotFoundError(id))
      }

      const updateData: Record<string, unknown> = {}

      // Only include fields that are being updated
      if (updates.residentId !== undefined) updateData.residentId = updates.residentId
      if (updates.caregiverId !== undefined) updateData.caregiverId = updates.caregiverId
      if (updates.activityType !== undefined) updateData.activityType = updates.activityType
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.timestamp !== undefined) updateData.timestamp = dateToTimestamp(updates.timestamp)
      if (updates.duration !== undefined) updateData.duration = updates.duration
      if (updates.notes !== undefined) updateData.notes = updates.notes
      if (updates.photos !== undefined) updateData.photos = updates.photos
      if (updates.status !== undefined) updateData.status = updates.status

      await updateDoc(docRef, updateData)

      // Fetch updated document
      const updatedDoc = await getDoc(docRef)
      const updatedData = updatedDoc.data()
      if (!updatedData) {
        return Err(createActivityLogNotFoundError(id))
      }
      const activityLogResult = firestoreDocToActivityLog(updatedDoc.id, updatedData)

      if (!activityLogResult.success) {
        return activityLogResult
      }

      return Ok(activityLogResult.value)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
        return Err(createActivityLogNotFoundError(id))
      }
      const message = error instanceof Error ? error.message : 'Failed to update activity log'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  async function deleteActivityLog(id: string): Promise<Result<void, ActivityLogError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createActivityLogNotFoundError(id))
      }

      await deleteDoc(docRef)
      return Ok(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete activity log'
      return Err(createActivityLogRepositoryError(message))
    }
  }

  return {
    create,
    findById,
    findByResident,
    findByCaregiver,
    findByResidentAndDateRange,
    findAll,
    update,
    ['delete']: deleteActivityLog,
  }
}
