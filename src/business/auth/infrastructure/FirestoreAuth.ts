import { signInWithEmailAndPassword, signOut as firebaseSignOut, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, type UserCredential } from 'firebase/auth'
import { auth } from '@/infrastructure/firebase/firebase.config'
import type { AuthRepository } from '@/business/auth/domain/AuthRepository'
import { FirebaseError } from 'firebase/app'
import { Ok, Err, type Result } from '@/shared/domain/Result'
import type { AuthError } from '@/business/auth/domain/AuthErrors'
import {
  createInvalidCredentialsError,
  createUserNotFoundError,
  createTooManyRequestsError,
  createUserDisabledError,
  createOperationNotAllowedError,
  createInvalidEmailError,
  createEmailAlreadyInUseError,
  createWeakPasswordError,
  createUnknownAuthError,
} from '@/business/auth/domain/AuthErrors'
import type { User } from '@/business/auth/domain/User'

const googleProvider = new GoogleAuthProvider()

function mapFirebaseError(error: FirebaseError): AuthError {
  const errorMap: Record<string, () => AuthError> = {
    'auth/invalid-email': () => createInvalidEmailError('El email no es válido'),
    'auth/user-not-found': () => createUserNotFoundError('El usuario no existe'),
    'auth/wrong-password': () => createInvalidCredentialsError('La contraseña no es válida'),
    'auth/invalid-credential': () => createInvalidCredentialsError('La credencial no es válida'),
    'auth/invalid-password': () => createInvalidCredentialsError('La contraseña no es válida'),
    'auth/too-many-requests': () => createTooManyRequestsError('Demasiadas solicitudes. Intenta nuevamente más tarde.'),
    'auth/user-disabled': () => createUserDisabledError('El usuario está deshabilitado'),
    'auth/operation-not-allowed': () => createOperationNotAllowedError('Operación no permitida'),
    'auth/popup-closed-by-user': () => createUnknownAuthError('El popup de autenticación fue cerrado'),
    'auth/popup-blocked': () => createOperationNotAllowedError('El popup fue bloqueado. Por favor, permite popups para este sitio'),
    'auth/cancelled-popup-request': () => createUnknownAuthError('La solicitud de popup fue cancelada'),
    'auth/email-already-in-use': () => createEmailAlreadyInUseError('El email ya está en uso'),
    'auth/weak-password': () => createWeakPasswordError('La contraseña debe tener al menos 6 caracteres'),
  }

  return errorMap[error.code]?.() || createUnknownAuthError('Error desconocido al iniciar sesión')
}

function mapUserCredentialToUser(userCredential: UserCredential): User {
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName,
    emailVerified: userCredential.user.emailVerified,
    photoURL: userCredential.user.photoURL,
  }
}

export const createAuthRepository = (): AuthRepository => {
  async function signIn(email: string, password: string): Promise<Result<User, AuthError>> {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password)
      return Ok(mapUserCredentialToUser(user))
    } catch (error) {
      if (error instanceof FirebaseError) {
        return Err(mapFirebaseError(error))
      }
      return Err(createUnknownAuthError('Error inesperado al iniciar sesión'))
    }
  }

  async function signInWithGoogle(): Promise<Result<User, AuthError>> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
      return Ok(mapUserCredentialToUser(userCredential))
    } catch (error) {
      if (error instanceof FirebaseError) {
        return Err(mapFirebaseError(error))
      }
      return Err(createUnknownAuthError('Error inesperado al iniciar sesión con Google'))
    }
  }

  async function signUp(email: string, password: string): Promise<Result<User, AuthError>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return Ok(mapUserCredentialToUser(userCredential))
    } catch (error) {
      if (error instanceof FirebaseError) {
        return Err(mapFirebaseError(error))
      }
      return Err(createUnknownAuthError('Error inesperado al registrarse'))
    }
  }

  async function sendVerificationEmail(user: User): Promise<Result<void, AuthError>> {
    try {
      // Get the current Firebase user by UID
      const currentUser = auth.currentUser
      if (!currentUser || currentUser.uid !== user.uid) {
        return Err(createUnknownAuthError('Usuario no autenticado'))
      }
      await sendEmailVerification(currentUser)
      return Ok(undefined)
    } catch (error) {
      if (error instanceof FirebaseError) {
        return Err(mapFirebaseError(error))
      }
      return Err(createUnknownAuthError('Error inesperado al enviar email de verificación'))
    }
  }

  async function signOut(): Promise<Result<void, AuthError>> {
    try {
      await firebaseSignOut(auth)
      return Ok(undefined)
    } catch (error) {
      if (error instanceof FirebaseError) {
        return Err(mapFirebaseError(error))
      }
      return Err(createUnknownAuthError('Error inesperado al cerrar sesión'))
    }
  }

  return {
    signIn,
    signInWithGoogle,
    signUp,
    sendVerificationEmail,
    signOut,
  }
}
