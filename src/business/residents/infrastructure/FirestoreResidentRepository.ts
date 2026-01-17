import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  type Firestore,
} from 'firebase/firestore'
import type { ResidentRepository } from '../domain/ResidentRepository'
import type { Resident } from '../domain/Resident'
import type { ResidentError } from '../domain/ResidentErrors'
import {
  createResidentNotFoundError,
  createUnknownResidentError,
} from '../domain/ResidentErrors'
import { type Result, Ok, Err } from '@/shared/domain/Result'

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
 * Convert Firestore document to Resident entity
 */
function firestoreDocToResident(docId: string, data: Record<string, unknown>): Resident {
  return {
    id: docId,
    firstName: data.firstName as string,
    lastName: data.lastName as string,
    dateOfBirth: timestampToDate(data.dateOfBirth as TimestampLike),
    photoURL: data.photoURL as string | undefined,
    medicalInfo: data.medicalInfo as Resident['medicalInfo'],
    emergencyContacts: (data.emergencyContacts as Resident['emergencyContacts']) || [],
    assignedCaregivers: (data.assignedCaregivers as string[]) || [],
    createdAt: timestampToDate(data.createdAt as TimestampLike),
    updatedAt: timestampToDate(data.updatedAt as TimestampLike),
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

      const resident = firestoreDocToResident(docSnap.id, docData)
      return Ok(resident)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find resident'
      return Err(createUnknownResidentError(message))
    }
  }

  async function findAll(): Promise<Result<Resident[], ResidentError>> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const residents = querySnapshot.docs.map((doc) => firestoreDocToResident(doc.id, doc.data()))
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
      const residents = querySnapshot.docs.map((doc) => firestoreDocToResident(doc.id, doc.data()))
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
      const resident = firestoreDocToResident(updatedDoc.id, updatedData)

      return Ok(resident)
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
