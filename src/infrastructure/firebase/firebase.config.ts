import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// Firebase configuration for emulator
// In production, these would come from environment variables
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'demo-app-id'
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Auth
export const auth = getAuth(app)

// Connect to emulator in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  } catch (error) {
    // Emulator already connected, ignore
    console.warn('Auth emulator connection:', error)
  }
}


