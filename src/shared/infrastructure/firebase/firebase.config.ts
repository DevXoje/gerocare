import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
	CACHE_SIZE_UNLIMITED,
	connectFirestoreEmulator,
	getFirestore,
	initializeFirestore,
	persistentLocalCache,
} from 'firebase/firestore'

// Firebase configuration for emulator
// In production, these would come from environment variables
const firebaseConfig = {
	apiKey: 'demo-api-key',
	authDomain: 'demo-project.firebaseapp.com',
	projectId: 'demo-project',
	storageBucket: 'demo-project.appspot.com',
	messagingSenderId: '123456789',
	appId: 'demo-app-id',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Auth
export const auth = getAuth(app)

// Initialize Firestore with offline persistence
let db: ReturnType<typeof getFirestore>

if (import.meta.env.DEV) {
	// In development, use regular getFirestore for emulator compatibility
	// Note: Persistent cache may not work with emulator, so we use memory cache in dev
	db = getFirestore(app)

	// La app Vue se ejecuta en el navegador del usuario, no en el contenedor Docker
	// Por lo tanto, siempre debe usar 'localhost' para acceder a los emuladores
	// Los puertos de los emuladores están mapeados al host, así que el navegador
	// puede acceder a ellos a través de localhost:9099 y localhost:8080
	const emulatorsHost = 'localhost'

	try {
		connectAuthEmulator(auth, `http://${emulatorsHost}:9099`, { disableWarnings: true })
	} catch (error) {
		// Emulator already connected, ignore
		console.warn('Auth emulator connection:', error)
	}

	try {
		connectFirestoreEmulator(db, emulatorsHost, 8080)
	} catch (error) {
		// Emulator already connected, ignore
		console.warn('Firestore emulator connection:', error)
	}
} else {
	// In production, initialize with persistent cache for offline support
	// Using the new localCache API instead of deprecated enableIndexedDbPersistence()
	db = initializeFirestore(app, {
		localCache: persistentLocalCache({
			cacheSizeBytes: CACHE_SIZE_UNLIMITED,
		}),
	})
}

export { db }
