import type { Firestore } from 'firebase/firestore'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'

/**
 * Helper to create a document in a collection
 */
export async function createDocument<T extends Record<string, any>>(
  db: Firestore,
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data)
  return docRef.id
}

/**
 * Helper to get a document by ID
 */
export async function getDocumentById<T>(
  db: Firestore,
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return null
  }
  
  return { id: docSnap.id, ...docSnap.data() } as T
}

/**
 * Helper to get all documents from a collection
 */
export async function getAllDocuments<T>(
  db: Firestore,
  collectionName: string
): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName))
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[]
}

/**
 * Helper to update a document
 */
export async function updateDocument<T extends Record<string, any>>(
  db: Firestore,
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, data as any)
}

/**
 * Helper to delete a document
 */
export async function deleteDocument(
  db: Firestore,
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

/**
 * Helper to query documents with a where clause
 */
export async function queryDocuments<T>(
  db: Firestore,
  collectionName: string,
  field: string,
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any',
  value: any
): Promise<T[]> {
  const q = query(collection(db, collectionName), where(field, operator, value))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[]
}

