import { FirebaseError } from 'firebase/app'
import type { Auth, AuthProvider, UserCredential } from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthRepository } from '@/business/auth/domain/AuthRepository'
import { createTestUser } from '@/test/helpers/auth'

import { createAuthRepository } from '../FirestoreAuth'

// Create mock functions that will be used in the mock
const mockSignInWithPopupFn = vi.fn()
const mockCreateUserWithEmailAndPasswordFn = vi.fn()

// Mock Firebase Auth
vi.mock('firebase/auth', async () => {
	const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth')
	class MockGoogleAuthProvider {
		// Mock provider class for testing
	}
	return {
		...actual,
		signInWithPopup: (_auth: Auth, _provider: AuthProvider) =>
			mockSignInWithPopupFn(_auth, _provider),
		createUserWithEmailAndPassword: (_auth: Auth, email: string, password: string) =>
			mockCreateUserWithEmailAndPasswordFn(_auth, email, password),
		GoogleAuthProvider: MockGoogleAuthProvider,
	}
})

// Mock Firebase config
vi.mock('@/shared/infrastructure/firebase/firebase.config', () => ({
	auth: {} as Auth,
}))

describe('FirestoreAuth - signInWithGoogle', () => {
	let repository: AuthRepository

	beforeEach(() => {
		vi.clearAllMocks()
		repository = createAuthRepository()
	})

	describe('successful sign in', () => {
		it('should sign in successfully with Google', async () => {
			const mockUserCredential: UserCredential = {
				user: createTestUser({
					uid: 'google-user-123',
					email: 'user@gmail.com',
					displayName: 'John Doe',
					photoURL: 'https://example.com/photo.jpg',
					emailVerified: true,
				}),
			} as UserCredential

			mockSignInWithPopupFn.mockResolvedValue(mockUserCredential)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(true)
			expect(mockSignInWithPopupFn).toHaveBeenCalled()

			if (!result.success) return
			expect(result.value.uid).toBe('google-user-123')
			expect(result.value.email).toBe('user@gmail.com')
			expect(result.value.displayName).toBe('John Doe')
			expect(result.value.photoURL).toBe('https://example.com/photo.jpg')
			expect(result.value.emailVerified).toBe(true)
		})

		it('should map user credential to User correctly', async () => {
			const mockUserCredential: UserCredential = {
				user: createTestUser({
					uid: 'user-456',
					email: 'test@example.com',
					displayName: 'Jane Smith',
					photoURL: 'https://example.com/jane.jpg',
					emailVerified: false,
				}),
			} as UserCredential

			mockSignInWithPopupFn.mockResolvedValue(mockUserCredential)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(true)
			if (!result.success) return
			expect(result.value.uid).toBe('user-456')
			expect(result.value.email).toBe('test@example.com')
			expect(result.value.displayName).toBe('Jane Smith')
			expect(result.value.photoURL).toBe('https://example.com/jane.jpg')
			expect(result.value.emailVerified).toBe(false)
		})
	})

	describe('error handling', () => {
		it('should handle popup closed by user error', async () => {
			const firebaseError = new FirebaseError(
				'auth/popup-closed-by-user',
				'Popup was closed by user'
			)
			mockSignInWithPopupFn.mockRejectedValue(firebaseError)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('UNKNOWN')
			expect(result.error.message).toContain('popup')
		})

		it('should handle popup blocked error', async () => {
			const firebaseError = new FirebaseError('auth/popup-blocked', 'Popup was blocked')
			mockSignInWithPopupFn.mockRejectedValue(firebaseError)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('OPERATION_NOT_ALLOWED')
			expect(result.error.message).toContain('popup')
		})

		it('should handle cancelled popup request error', async () => {
			const firebaseError = new FirebaseError(
				'auth/cancelled-popup-request',
				'Popup request was cancelled'
			)
			mockSignInWithPopupFn.mockRejectedValue(firebaseError)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('UNKNOWN')
			expect(result.error.message).toContain('popup')
		})

		it('should handle unknown Firebase errors', async () => {
			const firebaseError = new FirebaseError('auth/some-unknown-error', 'Unknown error occurred')
			mockSignInWithPopupFn.mockRejectedValue(firebaseError)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('UNKNOWN')
		})

		it('should handle non-Firebase errors', async () => {
			const genericError = new Error('Network error')
			mockSignInWithPopupFn.mockRejectedValue(genericError)

			const result = await repository.signInWithGoogle()

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('UNKNOWN')
			expect(result.error.message).toContain('inesperado')
		})
	})
})

describe('FirestoreAuth - signUp', () => {
	let repository: AuthRepository

	beforeEach(() => {
		vi.clearAllMocks()
		repository = createAuthRepository()
	})

	describe('successful sign up', () => {
		it('should sign up successfully with email and password', async () => {
			const mockUserCredential: UserCredential = {
				user: createTestUser({
					uid: 'new-user-123',
					email: 'newuser@example.com',
					displayName: null,
					photoURL: null,
					emailVerified: false,
				}),
			} as UserCredential

			mockCreateUserWithEmailAndPasswordFn.mockResolvedValue(mockUserCredential)

			const result = await repository.signUp('newuser@example.com', 'password123')

			expect(result.success).toBe(true)
			expect(mockCreateUserWithEmailAndPasswordFn).toHaveBeenCalledWith(
				expect.anything(),
				'newuser@example.com',
				'password123'
			)

			if (!result.success) return
			expect(result.value.uid).toBe('new-user-123')
			expect(result.value.email).toBe('newuser@example.com')
			expect(result.value.emailVerified).toBe(false)
		})

		it('should map user credential to User correctly', async () => {
			const mockUserCredential: UserCredential = {
				user: createTestUser({
					uid: 'user-789',
					email: 'test@example.com',
					displayName: 'Test User',
					photoURL: 'https://example.com/photo.jpg',
					emailVerified: true,
				}),
			} as UserCredential

			mockCreateUserWithEmailAndPasswordFn.mockResolvedValue(mockUserCredential)

			const result = await repository.signUp('test@example.com', 'password123')

			expect(result.success).toBe(true)
			if (!result.success) return
			expect(result.value.uid).toBe('user-789')
			expect(result.value.email).toBe('test@example.com')
			expect(result.value.displayName).toBe('Test User')
			expect(result.value.photoURL).toBe('https://example.com/photo.jpg')
			expect(result.value.emailVerified).toBe(true)
		})
	})

	describe('error handling', () => {
		it('should handle email already in use error', async () => {
			const firebaseError = new FirebaseError('auth/email-already-in-use', 'Email already in use')
			mockCreateUserWithEmailAndPasswordFn.mockRejectedValue(firebaseError)

			const result = await repository.signUp('existing@example.com', 'password123')

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('EMAIL_ALREADY_IN_USE')
			expect(result.error.message).toContain('email')
		})

		it('should handle weak password error', async () => {
			const firebaseError = new FirebaseError(
				'auth/weak-password',
				'Password should be at least 6 characters'
			)
			mockCreateUserWithEmailAndPasswordFn.mockRejectedValue(firebaseError)

			const result = await repository.signUp('test@example.com', '123')

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('WEAK_PASSWORD')
			expect(result.error.message).toContain('contraseña')
		})

		it('should handle invalid email error', async () => {
			const firebaseError = new FirebaseError('auth/invalid-email', 'Invalid email')
			mockCreateUserWithEmailAndPasswordFn.mockRejectedValue(firebaseError)

			const result = await repository.signUp('invalid-email', 'password123')

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('INVALID_EMAIL')
		})

		it('should handle unknown Firebase errors', async () => {
			const firebaseError = new FirebaseError('auth/some-unknown-error', 'Unknown error occurred')
			mockCreateUserWithEmailAndPasswordFn.mockRejectedValue(firebaseError)

			const result = await repository.signUp('test@example.com', 'password123')

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('UNKNOWN')
		})

		it('should handle non-Firebase errors', async () => {
			const genericError = new Error('Network error')
			mockCreateUserWithEmailAndPasswordFn.mockRejectedValue(genericError)

			const result = await repository.signUp('test@example.com', 'password123')

			expect(result.success).toBe(false)
			if (result.success) return
			expect(result.error.type).toBe('UNKNOWN')
			expect(result.error.message).toContain('inesperado')
		})
	})
})
