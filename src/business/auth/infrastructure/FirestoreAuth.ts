import { FirebaseError } from 'firebase/app'
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	reload,
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
import { Err, Ok, type Result } from '@/shared/domain/Result'
import { logError } from '@/shared/error/errorLogger'
import { auth } from '@/shared/infrastructure/firebase/firebase.config'

const googleProvider = new GoogleAuthProvider()

function mapFirebaseError(error: FirebaseError, t?: (key: string) => string): AuthError {
	const errorMap: Record<string, () => AuthError> = {
		'auth/invalid-email': () => createInvalidEmailError(t),
		'auth/user-not-found': () => createUserNotFoundError(t, t?.('auth.errors.userNotExists')),
		'auth/wrong-password': () => createInvalidCredentialsError(t, t?.('auth.errors.passwordNotValid')),
		'auth/invalid-credential': () => createInvalidCredentialsError(t, t?.('auth.errors.credentialNotValid')),
		'auth/invalid-password': () => createInvalidCredentialsError(t, t?.('auth.errors.passwordNotValid')),
		'auth/too-many-requests': () => createTooManyRequestsError(t, t?.('auth.errors.tooManyRequestsRetry')),
		'auth/user-disabled': () => createUserDisabledError(t),
		'auth/operation-not-allowed': () => createOperationNotAllowedError(t),
		'auth/popup-closed-by-user': () => createUnknownAuthError(t, t?.('auth.errors.popupClosed')),
		'auth/popup-blocked': () => createOperationNotAllowedError(t, t?.('auth.errors.popupBlocked')),
		'auth/cancelled-popup-request': () => createUnknownAuthError(t, t?.('auth.errors.popupCancelled')),
		'auth/email-already-in-use': () => createEmailAlreadyInUseError(t),
		'auth/weak-password': () => createWeakPasswordError(t, t?.('auth.errors.passwordMinLength')),
	}

	return errorMap[error.code]?.() || createUnknownAuthError(t)
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

export const createAuthRepository = (t?: (key: string) => string): AuthRepository => {
	async function signIn(email: string, password: string): Promise<Result<User, AuthError>> {
		try {
			const user = await signInWithEmailAndPassword(auth, email, password)
			return Ok(mapUserCredentialToUser(user))
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error, t)
				logError(authError, { operation: 'signIn', email })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(t, t?.('auth.errors.unexpectedSignIn'))
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
				const authError = mapFirebaseError(error, t)
				logError(authError, { operation: 'signInWithGoogle' })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(t, t?.('auth.errors.unexpectedSignInGoogle'))
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
				const authError = mapFirebaseError(error, t)
				logError(authError, { operation: 'signUp', email })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(t, t?.('auth.errors.unexpectedSignUp'))
			logError(unknownError, { operation: 'signUp', email, originalError: error })
			return Err(unknownError)
		}
	}

	async function sendVerificationEmail(user: User): Promise<Result<void, AuthError>> {
		try {
			// Get the current Firebase user by UID
			const currentUser = auth.currentUser
			if (!currentUser || currentUser.uid !== user.uid) {
				return Err(createUnknownAuthError(t, t?.('auth.errors.userNotAuthenticated')))
			}
			await sendEmailVerification(currentUser)
			return Ok(undefined)
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error, t)
				logError(authError, { operation: 'sendVerificationEmail', userId: user.uid })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(t, t?.('auth.errors.unexpectedVerificationEmail'))
			logError(unknownError, {
				operation: 'sendVerificationEmail',
				userId: user.uid,
				originalError: error,
			})
			return Err(unknownError)
		}
	}

	async function reloadUser(): Promise<Result<User, AuthError>> {
		try {
			const currentUser = auth.currentUser
			if (!currentUser) {
				return Err(createUnknownAuthError(t, t?.('auth.errors.userNotAuthenticated')))
			}
			await reload(currentUser)
			return Ok(mapUserCredentialToUser({ user: currentUser } as UserCredential))
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error, t)
				logError(authError, { operation: 'reloadUser' })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(t, t?.('auth.errors.unexpectedReload'))
			logError(unknownError, { operation: 'reloadUser', originalError: error })
			return Err(unknownError)
		}
	}

	async function signOut(): Promise<Result<void, AuthError>> {
		try {
			await firebaseSignOut(auth)
			return Ok(undefined)
		} catch (error) {
			if (error instanceof FirebaseError) {
				const authError = mapFirebaseError(error, t)
				logError(authError, { operation: 'signOut' })
				return Err(authError)
			}
			const unknownError = createUnknownAuthError(t, t?.('auth.errors.unexpectedSignOut'))
			logError(unknownError, { operation: 'signOut', originalError: error })
			return Err(unknownError)
		}
	}

	return {
		signIn,
		signInWithGoogle,
		signUp,
		sendVerificationEmail,
		reloadUser,
		signOut,
	}
}
