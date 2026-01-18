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

import { Err,Ok, type Result } from '@/shared/domain/Result'

import type { Medication, MedicationAdministration } from '../domain/Medication'
import { MedicationSchema } from '../domain/Medication.schema'
import type { MedicationError } from '../domain/MedicationErrors'
import {
  createMedicationNotFoundError,
  createMedicationValidationError,
  createUnknownMedicationError,
} from '../domain/MedicationErrors'
import type { MedicationRepository } from '../domain/MedicationRepository'

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
 * Convert Firestore document to Medication entity with Zod validation
 */
function firestoreDocToMedication(docId: string, data: Record<string, unknown>): Result<Medication, MedicationError> {
  try {
    // Convert Firestore Timestamp to Date
    const medicationData = {
      id: docId,
      residentId: data.residentId,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: timestampToDate(data.startDate as TimestampLike),
      endDate: data.endDate ? timestampToDate(data.endDate as TimestampLike) : undefined,
      instructions: data.instructions,
      prescribedBy: data.prescribedBy,
      createdAt: timestampToDate(data.createdAt as TimestampLike),
      updatedAt: timestampToDate(data.updatedAt as TimestampLike),
    }

    // Validate with Zod schema
    const result = MedicationSchema.safeParse(medicationData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return Err(createMedicationValidationError(`Invalid medication data from Firestore: ${firstError?.message || 'Validation failed'}`))
    }

    return Ok(result.data)
  } catch (error) {
    return Err(createUnknownMedicationError('Failed to convert Firestore document to Medication'))
  }
}

/**
 * Convert Firestore document to MedicationAdministration entity
 */
function firestoreDocToAdministration(docId: string, data: Record<string, unknown>): MedicationAdministration {
  return {
    id: docId,
    medicationId: data.medicationId as string,
    residentId: data.residentId as string,
    administeredAt: timestampToDate(data.administeredAt as TimestampLike),
    administeredBy: data.administeredBy as string,
    notes: data.notes as string | undefined,
    status: data.status as 'administered' | 'missed' | 'skipped',
  }
}

export function createMedicationRepository(db: Firestore): MedicationRepository {
  const collectionName = 'medications'
  const administrationCollectionName = 'medicationAdministrations'

  async function create(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Medication, MedicationError>> {
    try {
      const now = new Date()
      const medicationData = {
        ...medication,
        startDate: dateToTimestamp(medication.startDate),
        endDate: medication.endDate ? dateToTimestamp(medication.endDate) : null,
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
      }

      const docRef = await addDoc(collection(db, collectionName), medicationData)
      const createdMedication: Medication = {
        ...medication,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      }

      return Ok(createdMedication)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create medication'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function findById(id: string): Promise<Result<Medication | null, MedicationError>> {
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

      const medicationResult = firestoreDocToMedication(docSnap.id, docData)
      if (!medicationResult.success) {
        return medicationResult
      }
      return Ok(medicationResult.value)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find medication'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function findByResident(residentId: string): Promise<Result<Medication[], MedicationError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('residentId', '==', residentId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const medicationResults = querySnapshot.docs.map((doc) => firestoreDocToMedication(doc.id, doc.data()))
      
      // Check for validation errors
      const errors = medicationResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Medication[], MedicationError>
      }

      const medications = medicationResults.map((r) => (r.success ? r.value : null)).filter((m): m is Medication => m !== null)
      return Ok(medications)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find medications by resident'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function findAll(): Promise<Result<Medication[], MedicationError>> {
    try {
      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const medicationResults = querySnapshot.docs.map((doc) => firestoreDocToMedication(doc.id, doc.data()))
      
      // Check for validation errors
      const errors = medicationResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Medication[], MedicationError>
      }

      const medications = medicationResults.map((r) => (r.success ? r.value : null)).filter((m): m is Medication => m !== null)
      return Ok(medications)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find medications'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function update(id: string, updates: Partial<Omit<Medication, 'id' | 'createdAt'>>): Promise<Result<Medication, MedicationError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createMedicationNotFoundError(`Medication with id ${id} not found`))
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
        return Err(createMedicationNotFoundError(`Medication with id ${id} not found after update`))
      }
      const medicationResult = firestoreDocToMedication(updatedDoc.id, updatedData)
      
      if (!medicationResult.success) {
        return medicationResult
      }

      return Ok(medicationResult.value)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
        return Err(createMedicationNotFoundError(`Medication with id ${id} not found`))
      }
      const message = error instanceof Error ? error.message : 'Failed to update medication'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function deleteMedication(id: string): Promise<Result<void, MedicationError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createMedicationNotFoundError(`Medication with id ${id} not found`))
      }

      await deleteDoc(docRef)
      return Ok(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete medication'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function recordAdministration(administration: Omit<MedicationAdministration, 'id'>): Promise<Result<MedicationAdministration, MedicationError>> {
    try {
      const administrationData = {
        ...administration,
        administeredAt: dateToTimestamp(administration.administeredAt),
      }

      const docRef = await addDoc(collection(db, administrationCollectionName), administrationData)
      const createdAdministration: MedicationAdministration = {
        ...administration,
        id: docRef.id,
      }

      return Ok(createdAdministration)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record medication administration'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function getAdministrationHistory(medicationId: string): Promise<Result<MedicationAdministration[], MedicationError>> {
    try {
      const q = query(
        collection(db, administrationCollectionName),
        where('medicationId', '==', medicationId),
        orderBy('administeredAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const administrations = querySnapshot.docs.map((doc) => firestoreDocToAdministration(doc.id, doc.data()))
      return Ok(administrations)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get administration history'
      return Err(createUnknownMedicationError(message))
    }
  }

  async function getResidentAdministrationHistory(residentId: string): Promise<Result<MedicationAdministration[], MedicationError>> {
    try {
      const q = query(
        collection(db, administrationCollectionName),
        where('residentId', '==', residentId),
        orderBy('administeredAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const administrations = querySnapshot.docs.map((doc) => firestoreDocToAdministration(doc.id, doc.data()))
      return Ok(administrations)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get resident administration history'
      return Err(createUnknownMedicationError(message))
    }
  }

  return {
    create,
    findById,
    findByResident,
    findAll,
    update,
    ['delete']: deleteMedication,
    recordAdministration,
    getAdministrationHistory,
    getResidentAdministrationHistory,
  }
}
