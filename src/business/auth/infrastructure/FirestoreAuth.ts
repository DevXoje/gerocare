import { FirebaseError } from 'firebase/app'
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	sendEmailVerification,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut as firebaseSignOut,
	type UserCredential,
} from 'firebase/auth'

import type { AuthError } from '@/business/auth/domain/AuthErrors'
import {
	createEmailAlreadyInUseError,
	createInvalidCredentialsError,
	createInvalidEmailError,
	createOperationNotAllowedError,
	createTooManyRequestsError,
	createUnknownAuthError,
	createUserDisabledError,
	createUserNotFoundError,
	createWeakPasswordError,
} from '@/business/auth/domain/AuthErrors'
import type { AuthRepository } from '@/business/auth/domain/AuthRepository'
import type { User } from '@/business/auth/domain/User'
import { auth } from '@/shared/infrastructure/firebase/firebase.config'
import { Err, Ok, type Result } from '@/shared/domain/Result'
import { logError } from '@/shared/error/errorLogger'

const googleProvider = new GoogleAuthProvider()

function mapFirebaseError(error: FirebaseError): AuthError {
	const errorMap: Record<string, () => AuthError> = {
		'auth/invalid-email': () => createInvalidEmailError('El email no es válido'),
		'auth/user-not-found': () => createUserNotFoundError('El usuario no existe'),
		'auth/wrong-password': () => createInvalidCredentialsError('La contraseña no es válida'),
		'auth/invalid-credential': () => createInvalidCredentialsError('La credencial no es válida'),
		'auth/invalid-password': () => createInvalidCredentialsError('La contraseña no es válida'),
		'auth/too-many-requests': () =>
			createTooManyRequestsError('Demasiadas solicitudes. Intenta nuevamente más tarde.'),
		'auth/user-disabled': () => createUserDisabledError('El usuario está deshabilitado'),
		'auth/operation-not-allowed': () => createOperationNotAllowedError('Operación no permitida'),
		'auth/popup-closed-by-user': () =>
			createUnknownAuthError('El popup de autenticación fue cerrado'),
		'auth/popup-blocked': () =>
			createOperationNotAllowedError(
				'El popup fue bloqueado. Por favor, permite popups para este sitio'
			),
		'auth/cancelled-popup-request': () =>
			createUnknownAuthError('La solicitud de popup fue cancelada'),
		'auth/email-already-in-use': () => createEmailAlreadyInUseError('El email ya está en uso'),
		'auth/weak-password': () =>
			createWeakPasswordError('La contraseña debe tener al menos 6 caracteres'),
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
				const authError = mapFirebaseError(error)
				logError(authError, { operation: 'signIn', email })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError('Error inesperado al iniciar sesión')
			logError(unknownError, { operation: 'signIn', email, originalError: error })
			return Err(unknownError)
		}
	}

	async function signInWithGoogle(): Promise<Result<User, AuthError>> {
		try {
			const userCredential = await signInWithPopup(auth, googleProvider)
			return Ok(mapUserCredentialToUser(userCredential))
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error)
				logError(authError, { operation: 'signInWithGoogle' })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError('Error inesperado al iniciar sesión con Google')
			logError(unknownError, { operation: 'signInWithGoogle', originalError: error })
			return Err(unknownError)
		}
	}

	async function signUp(email: string, password: string): Promise<Result<User, AuthError>> {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password)
			return Ok(mapUserCredentialToUser(userCredential))
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error)
				logError(authError, { operation: 'signUp', email })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError('Error inesperado al registrarse')
			logError(unknownError, { operation: 'signUp', email, originalError: error })
			return Err(unknownError)
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
				const authError = mapFirebaseError(error)
				logError(authError, { operation: 'sendVerificationEmail', userId: user.uid })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(
				'Error inesperado al enviar email de verificación'
			)
			logError(unknownError, {
				operation: 'sendVerificationEmail',
				userId: user.uid,
				originalError: error,
			})
			return Err(unknownError)
		}
	}

	async function signOut(): Promise<Result<void, AuthError>> {
		try {
			await firebaseSignOut(auth)
			return Ok(undefined)
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error)
				logError(authError, { operation: 'signOut' })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError('Error inesperado al cerrar sesión')
			logError(unknownError, { operation: 'signOut', originalError: error })
			return Err(unknownError)
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
