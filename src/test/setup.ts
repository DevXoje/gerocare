// Import custom matchers
import './matchers/customMatchers'

import { initializeApp } from 'firebase/app'
import { collection, connectFirestoreEmulator, deleteDoc, doc,getDocs, getFirestore } from 'firebase/firestore'
import { afterAll, afterEach,beforeAll } from 'vitest'

// Firebase config for tests
const testFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id'
}

// Initialize Firebase for tests
export const testApp = initializeApp(testFirebaseConfig, 'test-app')
export const testDb = getFirestore(testApp)

// Connect to Firestore emulator (only if not already connected)
beforeAll(async () => {
  try {
    // Check if emulator is already connected by trying to connect
    connectFirestoreEmulator(testDb, 'localhost', 8080)
  } catch (error: any) {
    // Emulator already connected or not available, ignore
    if (error?.message && !error.message.includes('already been initialized')) {
      console.warn('Firestore emulator connection issue:', error.message)
    }
  }
})

// Clean up test data after each test
afterEach(async () => {
  // Clean up residents collection
  try {
    const residentsRef = collection(testDb, 'residents')
    const snapshot = await getDocs(residentsRef)
    const deletePromises = snapshot.docs.map((docSnapshot) => 
      deleteDoc(doc(testDb, 'residents', docSnapshot.id))
    )
    await Promise.all(deletePromises)
  } catch (error) {
    // Collection might not exist yet, ignore
  }
})

