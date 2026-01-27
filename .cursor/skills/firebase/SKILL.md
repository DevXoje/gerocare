---
name: firebase
description: >
  Patterns and conventions for working with Firebase Auth and Firestore in GeroCare.
  Trigger: When working with Firebase Auth, Firestore repositories, emulators, or Firebase error handling.
license: Apache-2.0
metadata:
  author: gero-cloud
  version: "1.0"
  scope: [root]
auto_invoke: "Working with Firebase Auth, Firestore, or Firebase emulators"
---

## When to Use

Use this skill when:
- Creating or modifying Firebase Auth repositories
- Creating or modifying Firestore repositories
- Working with Firebase emulators
- Handling Firebase errors and mapping them to domain errors
- Converting between Firestore Timestamps and JavaScript Dates
- Configuring Firebase for development or production
- Implementing offline support patterns

**Don't use this skill when:**
- Creating domain entities or repository interfaces (use `feature-development` instead)
- Writing application composables (use `feature-development` instead)
- Writing tests for Firebase (use `testing` skill instead)

---

## Critical Patterns

### 1. Auth Repository Pattern

**Always use Result types and map Firebase errors to domain errors:**

```typescript
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import type { AuthError } from '../domain/AuthErrors'
import { createInvalidCredentialsError, createUnknownAuthError } from '../domain/AuthErrors'
import { Err, Ok, type Result } from '@/shared/domain/Result'
import { logError } from '@/shared/error/errorLogger'

function mapFirebaseError(error: FirebaseError): AuthError {
  const errorMap: Record<string, () => AuthError> = {
    'auth/invalid-email': () => createInvalidEmailError('El email no es válido'),
    'auth/user-not-found': () => createUserNotFoundError('El usuario no existe'),
    'auth/wrong-password': () => createInvalidCredentialsError('La contraseña no es válida'),
    'auth/invalid-credential': () => createInvalidCredentialsError('La credencial no es válida'),
    // ... more error mappings
  }

  return errorMap[error.code]?.() || createUnknownAuthError('Error desconocido')
}

async function signIn(email: string, password: string): Promise<Result<User, AuthError>> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return Ok(mapUserCredentialToUser(userCredential))
  } catch (error) {
    if (error instanceof FirebaseError) {
      const authError = mapFirebaseError(error)
      logError(authError, { operation: 'signIn', email })
      return Err(authError)
    }
    const unknownError = createUnknownAuthError('Error inesperado al iniciar sesión')
    logError(unknownError, { operation: 'signIn', email, originalError: error })
    return Err(unknownError)
  }
}
```

**Key Rules:**
- Always catch `FirebaseError` specifically
- Map all Firebase error codes to domain errors
- Log errors with context (operation, parameters)
- Return `Result<T, E>` type, never throw

### 2. Firestore Repository Pattern

**Always convert Timestamps and validate with Zod:**

```typescript
import { Timestamp } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { EntitySchema } from '../domain/Entity.schema'
import type { Entity } from '../domain/Entity'
import { Err, Ok, type Result } from '@/shared/domain/Result'

type TimestampLike = Timestamp | Date | string | { toDate?: () => Date }

// Convert Firestore Timestamp to JavaScript Date
function timestampToDate(timestamp: TimestampLike): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  return new Date(timestamp as string)
}

// Convert JavaScript Date to Firestore Timestamp
function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date)
}

// Convert Firestore document to domain entity with Zod validation
function firestoreDocToEntity(
  docId: string,
  data: Record<string, unknown>
): Result<Entity, EntityError> {
  try {
    // Convert Firestore Timestamp to Date
    const entityData = {
      id: docId,
      ...data,
      dateOfBirth: timestampToDate(data.dateOfBirth as TimestampLike),
      createdAt: timestampToDate(data.createdAt as TimestampLike),
      updatedAt: timestampToDate(data.updatedAt as TimestampLike),
    }

    // Validate with Zod schema
    const result = EntitySchema.safeParse(entityData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return Err(createEntityValidationError(
        `Invalid entity data from Firestore: ${firstError?.message || 'Validation failed'}`
      ))
    }

    return Ok(result.data)
  } catch (error) {
    return Err(createUnknownEntityError('Failed to convert Firestore document to Entity'))
  }
}

export function createEntityRepository(db: Firestore): EntityRepository {
  const collectionName = 'entities'

  async function create(
    entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<Entity, EntityError>> {
    try {
      const now = new Date()
      const entityData = {
        ...entity,
        dateOfBirth: dateToTimestamp(entity.dateOfBirth),
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
      }

      const docRef = await addDoc(collection(db, collectionName), entityData)
      const createdEntity: Entity = {
        ...entity,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      }

      return Ok(createdEntity)
    } catch (error) {
      return Err(createUnknownEntityError('Failed to create entity'))
    }
  }

  async function findById(id: string): Promise<Result<Entity | null, EntityError>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return Ok(null)
      }

      return firestoreDocToEntity(docSnap.id, docSnap.data())
    } catch (error) {
      return Err(createUnknownEntityError('Failed to find entity'))
    }
  }

  // ... other methods
}
```

**Key Rules:**
- Always convert Timestamps to Dates when reading from Firestore
- Always convert Dates to Timestamps when writing to Firestore
- Always validate Firestore data with Zod schemas before converting to domain entities
- Use `Result<T, E>` type for all repository methods
- Handle missing documents gracefully (return `Ok(null)`)

### 3. Error Mapping Pattern

**Create comprehensive error maps for all Firebase error codes:**

```typescript
function mapFirebaseError(error: FirebaseError): AuthError {
  const errorMap: Record<string, () => AuthError> = {
    // Auth errors
    'auth/invalid-email': () => createInvalidEmailError('El email no es válido'),
    'auth/user-not-found': () => createUserNotFoundError('El usuario no existe'),
    'auth/wrong-password': () => createInvalidCredentialsError('La contraseña no es válida'),
    'auth/invalid-credential': () => createInvalidCredentialsError('La credencial no es válida'),
    'auth/too-many-requests': () => createTooManyRequestsError('Demasiadas solicitudes'),
    'auth/user-disabled': () => createUserDisabledError('El usuario está deshabilitado'),
    'auth/operation-not-allowed': () => createOperationNotAllowedError('Operación no permitida'),
    'auth/email-already-in-use': () => createEmailAlreadyInUseError('El email ya está en uso'),
    'auth/weak-password': () => createWeakPasswordError('La contraseña debe tener al menos 6 caracteres'),
    'auth/popup-closed-by-user': () => createUnknownAuthError('El popup fue cerrado'),
    'auth/popup-blocked': () => createOperationNotAllowedError('El popup fue bloqueado'),
    // ... add more as needed
  }

  return errorMap[error.code]?.() || createUnknownAuthError('Error desconocido')
}
```

**Key Rules:**
- Map all known Firebase error codes
- Provide user-friendly error messages in Spanish (for GeroCare)
- Always have a fallback for unknown errors
- Use domain-specific error factories

### 4. Emulator Configuration

**Configure emulators for development:**

```typescript
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

export const auth = getAuth(app)
export let db: ReturnType<typeof getFirestore>

if (import.meta.env.DEV) {
  // Use regular getFirestore for emulator compatibility
  db = getFirestore(app)

  const emulatorsHost = 'localhost' // Always localhost in browser

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
  // Production: Use persistent cache for offline support
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    }),
  })
}
```

**Key Rules:**
- Always use `localhost` for emulators (browser context)
- Wrap emulator connections in try-catch (may already be connected)
- Use persistent cache in production for offline support
- Use memory cache in development (emulator compatibility)

### 5. Queries Pattern

**Use Firestore queries with proper error handling:**

```typescript
async function findByCaregiver(caregiverId: string): Promise<Result<Entity[], EntityError>> {
  try {
    const q = query(
      collection(db, collectionName),
      where('assignedCaregivers', 'array-contains', caregiverId)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map(doc =>
      firestoreDocToEntity(doc.id, doc.data())
    )

    // Check for validation errors
    const errors = results.filter(r => !r.success)
    if (errors.length > 0) {
      return errors[0] as Result<Entity[], EntityError>
    }

    const entities = results
      .map(r => (r.success ? r.value : null))
      .filter((r): r is Entity => r !== null)
    return Ok(entities)
  } catch (error) {
    return Err(createUnknownEntityError('Failed to find entities by caregiver'))
  }
}
```

**Key Rules:**
- Use `query()` with `where()`, `orderBy()`, etc.
- Validate all documents from queries with Zod
- Handle validation errors in query results
- Filter out invalid documents gracefully

---

## Code Examples

### Example 1: Complete Auth Repository

See: [assets/examples/auth-patterns.ts](assets/examples/auth-patterns.ts)

### Example 2: Complete Firestore Repository

See: [assets/examples/firestore-patterns.ts](assets/examples/firestore-patterns.ts)

---

## Commands

```bash
# Start Firebase emulators (Auth, Firestore, UI)
npm run emulators

# Start dev server with emulators
npm run dev:emulators

# Seed database with test data
npm run seed

# Clear all seed data
npm run seed:clear
```

**Emulator URLs:**
- Firebase UI: http://localhost:4000
- Firestore: http://localhost:8080
- Auth: http://localhost:9099

---

## Decision Trees

### When to Use Auth vs Firestore

```
Need user authentication?
├─ Yes → Firebase Auth
│   └─ Use Auth repository pattern
│
└─ No → Need data storage?
    ├─ Yes → Firestore
    │   └─ Use Firestore repository pattern
    │
    └─ No → Not Firebase-related
```

### Error Handling Flow

```
Firebase operation
├─ Success → Return Ok(result)
│
└─ Error
    ├─ FirebaseError? → Map to domain error
    │   └─ Return Err(mappedError)
    │
    └─ Unknown error → Create unknown error
        └─ Return Err(unknownError)
```

---

## Common Patterns

### Pattern 1: Date Conversion

**Always convert dates in both directions:**

```typescript
// Reading from Firestore
const dateOfBirth = timestampToDate(data.dateOfBirth as TimestampLike)

// Writing to Firestore
const entityData = {
  ...entity,
  dateOfBirth: dateToTimestamp(entity.dateOfBirth),
}
```

### Pattern 2: Validation on Read

**Always validate Firestore data with Zod:**

```typescript
const result = EntitySchema.safeParse(entityData)
if (!result.success) {
  return Err(createEntityValidationError('Invalid data from Firestore'))
}
return Ok(result.data)
```

### Pattern 3: Error Logging

**Always log errors with context:**

```typescript
logError(authError, { operation: 'signIn', email })
logError(appError, { operation: 'create', entity, originalError: error })
```

---

## Resources

- **Firebase Config**: `src/shared/infrastructure/firebase/firebase.config.ts`
- **Auth Repository Example**: `src/business/auth/infrastructure/FirestoreAuth.ts`
- **Firestore Repository Example**: `src/business/residents/infrastructure/FirestoreResidentRepository.ts`
- **Activity Log Repository**: `src/business/activity-logs/infrastructure/FirestoreActivityLogRepository.ts`
- **Feature Development**: See `feature-development` skill for Clean Architecture context
- **Zod Validation**: See `zod` skill for validation schema patterns
- **Firebase Docs**: https://firebase.google.com/docs
