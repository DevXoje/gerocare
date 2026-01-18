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

import type { Shift } from '../domain/Shift'
import { ShiftSchema } from '../domain/Shift.schema'
import type { ShiftError } from '../domain/ShiftErrors'
import {
  createShiftNotFoundError,
  createShiftValidationError,
  createUnknownShiftError,
} from '../domain/ShiftErrors'
import type { ShiftRepository } from '../domain/ShiftRepository'

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
 * Convert Firestore document to Shift entity with Zod validation
 */
function firestoreDocToShift(docId: string, data: Record<string, unknown>): Result<Shift, ShiftError> {
  try {
    // Convert Firestore Timestamp to Date
    const shiftData = {
      id: docId,
      caregiverId: data.caregiverId,
      type: data.type,
      date: timestampToDate(data.date as TimestampLike),
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      notes: data.notes,
      assignedBy: data.assignedBy,
      createdAt: timestampToDate(data.createdAt as TimestampLike),
      updatedAt: timestampToDate(data.updatedAt as TimestampLike),
    }

    // Validate with Zod schema
    const result = ShiftSchema.safeParse(shiftData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return Err(createShiftValidationError(`Invalid shift data from Firestore: ${firstError?.message || 'Validation failed'}`))
    }

    return Ok(result.data)
  } catch (error) {
    return Err(createUnknownShiftError('Failed to convert Firestore document to Shift'))
  }
}

export function createShiftRepository(db: Firestore): ShiftRepository {
  const collectionName = 'shifts'

  async function create(shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Shift, ShiftError>> {
    try {
      const now = new Date()
      const shiftData = {
        ...shift,
        date: dateToTimestamp(shift.date),
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
      }

      const docRef = await addDoc(collection(db, collectionName), shiftData)
      const createdShift: Shift = {
        ...shift,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      }

      return Ok(createdShift)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create shift'
      return Err(createUnknownShiftError(message))
    }
  }

  async function findById(id: string): Promise<Result<Shift | null, ShiftError>> {
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

      const shiftResult = firestoreDocToShift(docSnap.id, docData)
      if (!shiftResult.success) {
        return shiftResult
      }
      return Ok(shiftResult.value)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find shift'
      return Err(createUnknownShiftError(message))
    }
  }

  async function findByCaregiver(caregiverId: string): Promise<Result<Shift[], ShiftError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('caregiverId', '==', caregiverId),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const shiftResults = querySnapshot.docs.map((doc) => firestoreDocToShift(doc.id, doc.data()))

      // Check for validation errors
      const errors = shiftResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Shift[], ShiftError>
      }

      const shifts = shiftResults.map((r) => (r.success ? r.value : null)).filter((c): c is Shift => c !== null)
      return Ok(shifts)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find shifts by caregiver'
      return Err(createUnknownShiftError(message))
    }
  }

  async function findByDateRange(startDate: Date, endDate: Date): Promise<Result<Shift[], ShiftError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('date', '>=', dateToTimestamp(startDate)),
        where('date', '<=', dateToTimestamp(endDate)),
        orderBy('date', 'asc'),
        orderBy('startTime', 'asc')
      )
      const querySnapshot = await getDocs(q)
      const shiftResults = querySnapshot.docs.map((doc) => firestoreDocToShift(doc.id, doc.data()))

      // Check for validation errors
      const errors = shiftResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Shift[], ShiftError>
      }

      const shifts = shiftResults.map((r) => (r.success ? r.value : null)).filter((c): c is Shift => c !== null)
      return Ok(shifts)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find shifts by date range'
      return Err(createUnknownShiftError(message))
    }
  }

  async function findByDate(date: Date): Promise<Result<Shift[], ShiftError>> {
    try {
      // Create start and end of day timestamps
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      return findByDateRange(startOfDay, endOfDay)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find shifts by date'
      return Err(createUnknownShiftError(message))
    }
  }

  async function findAll(): Promise<Result<Shift[], ShiftError>> {
    try {
      const q = query(collection(db, collectionName), orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      const shiftResults = querySnapshot.docs.map((doc) => firestoreDocToShift(doc.id, doc.data()))

      // Check for validation errors
      const errors = shiftResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Shift[], ShiftError>
      }

      const shifts = shiftResults.map((r) => (r.success ? r.value : null)).filter((c): c is Shift => c !== null)
      return Ok(shifts)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find shifts'
      return Err(createUnknownShiftError(message))
    }
  }

  async function update(id: string, updates: Partial<Omit<Shift, 'id' | 'createdAt'>>): Promise<Result<Shift, ShiftError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createShiftNotFoundError(`Shift with id ${id} not found`))
      }

      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: dateToTimestamp(new Date()),
      }

      // Convert date if present
      if (updates.date) {
        updateData.date = dateToTimestamp(updates.date)
      }

      await updateDoc(docRef, updateData)

      // Fetch updated document
      const updatedDoc = await getDoc(docRef)
      const updatedData = updatedDoc.data()
      if (!updatedData) {
        return Err(createShiftNotFoundError(`Shift with id ${id} not found after update`))
      }
      const shiftResult = firestoreDocToShift(updatedDoc.id, updatedData)

      if (!shiftResult.success) {
        return shiftResult
      }

      return Ok(shiftResult.value)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
        return Err(createShiftNotFoundError(`Shift with id ${id} not found`))
      }
      const message = error instanceof Error ? error.message : 'Failed to update shift'
      return Err(createUnknownShiftError(message))
    }
  }

  async function deleteShift(id: string): Promise<Result<void, ShiftError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createShiftNotFoundError(`Shift with id ${id} not found`))
      }

      await deleteDoc(docRef)
      return Ok(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete shift'
      return Err(createUnknownShiftError(message))
    }
  }

  return {
    create,
    findById,
    findByCaregiver,
    findByDateRange,
    findByDate,
    findAll,
    update,
    ['delete']: deleteShift,
  }
}
