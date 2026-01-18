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

import type { Incident } from '../domain/Incident'
import { IncidentSchema } from '../domain/Incident.schema'
import type { IncidentError } from '../domain/IncidentErrors'
import {
  createIncidentNotFoundError,
  createIncidentValidationError,
  createUnknownIncidentError,
} from '../domain/IncidentErrors'
import type { IncidentRepository } from '../domain/IncidentRepository'

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
 * Convert Firestore document to Incident entity with Zod validation
 */
function firestoreDocToIncident(docId: string, data: Record<string, unknown>): Result<Incident, IncidentError> {
  try {
    // Convert Firestore Timestamp to Date
    const incidentData = {
      id: docId,
      residentId: data.residentId,
      type: data.type,
      severity: data.severity,
      description: data.description,
      location: data.location,
      incidentDate: timestampToDate(data.incidentDate as TimestampLike),
      reportedBy: data.reportedBy,
      status: data.status,
      resolvedAt: data.resolvedAt ? timestampToDate(data.resolvedAt as TimestampLike) : undefined,
      resolvedBy: data.resolvedBy,
      resolutionNotes: data.resolutionNotes,
      witnessNames: data.witnessNames,
      createdAt: timestampToDate(data.createdAt as TimestampLike),
      updatedAt: timestampToDate(data.updatedAt as TimestampLike),
    }

    // Validate with Zod schema
    const result = IncidentSchema.safeParse(incidentData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return Err(createIncidentValidationError(`Invalid incident data from Firestore: ${firstError?.message || 'Validation failed'}`))
    }

    return Ok(result.data)
  } catch (error) {
    return Err(createUnknownIncidentError('Failed to convert Firestore document to Incident'))
  }
}

export function createIncidentRepository(db: Firestore): IncidentRepository {
  const collectionName = 'incidents'

  async function create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Incident, IncidentError>> {
    try {
      const now = new Date()
      const incidentData = {
        ...incident,
        incidentDate: dateToTimestamp(incident.incidentDate),
        resolvedAt: incident.resolvedAt ? dateToTimestamp(incident.resolvedAt) : null,
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
      }

      const docRef = await addDoc(collection(db, collectionName), incidentData)
      const createdIncident: Incident = {
        ...incident,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      }

      return Ok(createdIncident)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create incident'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function findById(id: string): Promise<Result<Incident | null, IncidentError>> {
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

      const incidentResult = firestoreDocToIncident(docSnap.id, docData)
      if (!incidentResult.success) {
        return incidentResult
      }
      return Ok(incidentResult.value)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find incident'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function findByResident(residentId: string): Promise<Result<Incident[], IncidentError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('residentId', '==', residentId),
        orderBy('incidentDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const incidentResults = querySnapshot.docs.map((doc) => firestoreDocToIncident(doc.id, doc.data()))

      // Check for validation errors
      const errors = incidentResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Incident[], IncidentError>
      }

      const incidents = incidentResults.map((r) => (r.success ? r.value : null)).filter((c): c is Incident => c !== null)
      return Ok(incidents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find incidents by resident'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function findUnresolvedByResident(residentId: string): Promise<Result<Incident[], IncidentError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('residentId', '==', residentId),
        where('status', 'in', ['reported', 'in-progress']),
        orderBy('incidentDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const incidentResults = querySnapshot.docs.map((doc) => firestoreDocToIncident(doc.id, doc.data()))

      // Check for validation errors
      const errors = incidentResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Incident[], IncidentError>
      }

      const incidents = incidentResults.map((r) => (r.success ? r.value : null)).filter((c): c is Incident => c !== null)
      return Ok(incidents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find unresolved incidents by resident'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function findBySeverity(severity: Incident['severity']): Promise<Result<Incident[], IncidentError>> {
    try {
      const q = query(
        collection(db, collectionName),
        where('severity', '==', severity),
        orderBy('incidentDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const incidentResults = querySnapshot.docs.map((doc) => firestoreDocToIncident(doc.id, doc.data()))

      // Check for validation errors
      const errors = incidentResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Incident[], IncidentError>
      }

      const incidents = incidentResults.map((r) => (r.success ? r.value : null)).filter((c): c is Incident => c !== null)
      return Ok(incidents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find incidents by severity'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function findAll(): Promise<Result<Incident[], IncidentError>> {
    try {
      const q = query(collection(db, collectionName), orderBy('incidentDate', 'desc'))
      const querySnapshot = await getDocs(q)
      const incidentResults = querySnapshot.docs.map((doc) => firestoreDocToIncident(doc.id, doc.data()))

      // Check for validation errors
      const errors = incidentResults.filter((r) => !r.success)
      if (errors.length > 0) {
        return errors[0] as Result<Incident[], IncidentError>
      }

      const incidents = incidentResults.map((r) => (r.success ? r.value : null)).filter((c): c is Incident => c !== null)
      return Ok(incidents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find incidents'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function update(id: string, updates: Partial<Omit<Incident, 'id' | 'createdAt'>>): Promise<Result<Incident, IncidentError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createIncidentNotFoundError(`Incident with id ${id} not found`))
      }

      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: dateToTimestamp(new Date()),
      }

      // Convert dates if present
      if (updates.incidentDate) {
        updateData.incidentDate = dateToTimestamp(updates.incidentDate)
      }
      if (updates.resolvedAt !== undefined) {
        updateData.resolvedAt = updates.resolvedAt ? dateToTimestamp(updates.resolvedAt) : null
      }

      await updateDoc(docRef, updateData)

      // Fetch updated document
      const updatedDoc = await getDoc(docRef)
      const updatedData = updatedDoc.data()
      if (!updatedData) {
        return Err(createIncidentNotFoundError(`Incident with id ${id} not found after update`))
      }
      const incidentResult = firestoreDocToIncident(updatedDoc.id, updatedData)

      if (!incidentResult.success) {
        return incidentResult
      }

      return Ok(incidentResult.value)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
        return Err(createIncidentNotFoundError(`Incident with id ${id} not found`))
      }
      const message = error instanceof Error ? error.message : 'Failed to update incident'
      return Err(createUnknownIncidentError(message))
    }
  }

  async function deleteIncident(id: string): Promise<Result<void, IncidentError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Err(createIncidentNotFoundError(`Incident with id ${id} not found`))
      }

      await deleteDoc(docRef)
      return Ok(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete incident'
      return Err(createUnknownIncidentError(message))
    }
  }

  return {
    create,
    findById,
    findByResident,
    findUnresolvedByResident,
    findBySeverity,
    findAll,
    update,
    ['delete']: deleteIncident,
  }
}
