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

import { Err,Ok, type Result } from '@/shared/domain/Result'

import type { Resident } from '../domain/Resident'
import { ResidentSchema } from '../domain/Resident.schema'
import type { ResidentError } from '../domain/ResidentErrors'
import {
  createResidentNotFoundError,
  createResidentValidationError,
  createUnknownResidentError,
} from '../domain/ResidentErrors'
import type { ResidentRepository } from '../domain/ResidentRepository'

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
 * Convert Firestore document to Resident entity with Zod validation
 */
function firestoreDocToResident(docId: string, data: Record<string, unknown>): Result<Resident, ResidentError> {
  try {
    // Convert Firestore Timestamp to Date
    const residentData = {
      id: docId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: timestampToDate(data.dateOfBirth as TimestampLike),
      medicalInfo: data.medicalInfo || {
        allergies: [],
        chronicConditions: [],
        medications: [],
        dietaryRestrictions: [],
      },
      emergencyContacts: data.emergencyContacts || [],
      assignedCaregivers: data.assignedCaregivers || [],
      createdAt: timestampToDate(data.createdAt as TimestampLike),
      updatedAt: timestampToDate(data.updatedAt as TimestampLike),
    }

    // Validate with Zod schema
    const result = ResidentSchema.safeParse(residentData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return Err(createResidentValidationError(`Invalid resident data from Firestore: ${firstError?.message || 'Validation failed'}`))
    }

    return Ok(result.data)
  } catch (error) {
    return Err(createUnknownResidentError('Failed to convert Firestore document to Resident'))
  }
}

export function createResidentRepository(db: Firestore): ResidentRepository {
  const collectionName = 'residents'

  async function create(resident: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Resident, ResidentError>> {
    try {
      const now = new Date()
      const residentData = {
        ...resident,
        dateOfBirth: dateToTimestamp(resident.dateOfBirth),
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
      }

      const docRef = await addDoc(collection(db, collectionName), residentData)
      const createdResident: Resident = {
        ...resident,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      }

      return Ok(createdResident)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create resident'
      return Err(createUnknownResidentError(message))
    }
  }

  async function findById(id: string): Promise<Result<Resident | null, ResidentError>> {
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

      const residentResult = firestoreDocToResident(docSnap.id, docData)
      if (!residentResult.success) {
        return residentResult
      }
      return Ok(residentResult.value)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find resident'
      return Err(createUnknownResidentError(message))
    }
  }

  async function findAll(): Promise<Result<Resident[], ResidentError>> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const residentResults = querySnapshot.docs.map((doc) => firestoreDocToResident(doc.id, doc.data()))
      
      // Check for validation errors
      const errors = residentResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Resident[], ResidentError>
      }

      const residents = residentResults.map((r) => (r.success ? r.value : null)).filter((r): r is Resident => r !== null)
      return Ok(residents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find residents'
      return Err(createUnknownResidentError(message))
    }
  }

  async function findByCaregiver(caregiverId: string): Promise<Result<Resident[], ResidentError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('assignedCaregivers', 'array-contains', caregiverId)
      )
      const querySnapshot = await getDocs(q)
      const residentResults = querySnapshot.docs.map((doc) => firestoreDocToResident(doc.id, doc.data()))
      
      // Check for validation errors
      const errors = residentResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Resident[], ResidentError>
      }

      const residents = residentResults.map((r) => (r.success ? r.value : null)).filter((r): r is Resident => r !== null)
      return Ok(residents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find residents by caregiver'
      return Err(createUnknownResidentError(message))
    }
  }

  async function update(id: string, updates: Partial<Omit<Resident, 'id' | 'createdAt'>>): Promise<Result<Resident, ResidentError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createResidentNotFoundError(`Resident with id ${id} not found`))
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
        return Err(createResidentNotFoundError(`Resident with id ${id} not found after update`))
      }
      const residentResult = firestoreDocToResident(updatedDoc.id, updatedData)
      
      if (!residentResult.success) {
        return residentResult
      }

      return Ok(residentResult.value)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
        return Err(createResidentNotFoundError(`Resident with id ${id} not found`))
      }
      const message = error instanceof Error ? error.message : 'Failed to update resident'
      return Err(createUnknownResidentError(message))
    }
  }

  async function deleteResident(id: string): Promise<Result<void, ResidentError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createResidentNotFoundError(`Resident with id ${id} not found`))
      }

      await deleteDoc(docRef)
      return Ok(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete resident'
      return Err(createUnknownResidentError(message))
    }
  }

  async function search(queryString: string): Promise<Result<Resident[], ResidentError>> {
    try {
      // Firestore doesn't support full-text search natively
      // We'll fetch all and filter in memory for now
      // In production, consider using Algolia or similar
      const allResidentsResult = await findAll()

      if (!allResidentsResult.success) {
        return allResidentsResult
      }

      const searchLower = queryString.toLowerCase().trim()
      const filtered = allResidentsResult.value.filter((resident) => {
        const firstNameMatch = resident.firstName.toLowerCase().includes(searchLower)
        const lastNameMatch = resident.lastName.toLowerCase().includes(searchLower)
        return firstNameMatch || lastNameMatch
      })

      return Ok(filtered)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search residents'
      return Err(createUnknownResidentError(message))
    }
  }

  return {
    create,
    findById,
    findAll,
    findByCaregiver,
    update,
    delete: deleteResident,
    search,
  }
}
