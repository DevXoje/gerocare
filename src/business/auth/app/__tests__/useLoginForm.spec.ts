import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUnknownAuthError } from '@/business/auth/domain/AuthErrors'
import { Err,Ok } from '@/shared/domain/Result'
import { createTestUser } from '@/test/helpers/auth'

import { useLoginForm } from '../useLoginForm'

// Mock useAuth
const mockSignIn = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockSignOut = vi.fn()

vi.mock('../useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
  }),
}))

// Mock vue-router
const mockPush = vi.fn()
const mockRoute = {
  query: {},
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => mockRoute,
}))

// Mock useNotifications
const mockError = vi.fn()
const mockSuccess = vi.fn()

vi.mock('@/shared/composables/useNotifications', () => ({
  useNotifications: () => ({
    error: mockError,
    success: mockSuccess,
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = {}
  })

  describe('handleGoogleSignIn', () => {
    it('should call signInWithGoogle when handleGoogleSignIn is called', async () => {
      const testUser = createTestUser({
        uid: 'google-user-123',
        email: 'user@gmail.com',
      })

      mockSignInWithGoogle.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { handleGoogleSignIn } = useLoginForm()

      await handleGoogleSignIn()

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('should set loading to true during sign in', async () => {
      const testUser = createTestUser()

      mockSignInWithGoogle.mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                Ok({
                  uid: testUser.uid,
                  email: testUser.email,
                  displayName: testUser.displayName,
                  photoURL: testUser.photoURL,
                  emailVerified: testUser.emailVerified,
                })
              ),
            100
          )
        )
      )

      const { handleGoogleSignIn, loading } = useLoginForm()

      const promise = handleGoogleSignIn()
      expect(loading.value).toBe(true)

      await promise
    })

    it('should set loading to false after sign in completes', async () => {
      const testUser = createTestUser()

      mockSignInWithGoogle.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { handleGoogleSignIn, loading } = useLoginForm()

      await handleGoogleSignIn()

      expect(loading.value).toBe(false)
    })

    it('should show success notification on successful sign in', async () => {
      const testUser = createTestUser()

      mockSignInWithGoogle.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { handleGoogleSignIn } = useLoginForm()

      await handleGoogleSignIn()

      expect(mockSuccess).toHaveBeenCalledWith('Sesión iniciada correctamente')
    })

    it('should show error notification on failed sign in', async () => {
      const authError = createUnknownAuthError('Error al iniciar sesión con Google')

      mockSignInWithGoogle.mockResolvedValue(Err(authError))

      const { handleGoogleSignIn } = useLoginForm()

      await handleGoogleSignIn()

      expect(mockError).toHaveBeenCalledWith('Error al iniciar sesión con Google')
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('should redirect to dashboard on successful sign in', async () => {
      const testUser = createTestUser()

      mockSignInWithGoogle.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { handleGoogleSignIn } = useLoginForm()

      await handleGoogleSignIn()

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should redirect to original destination if redirect query param exists', async () => {
      const testUser = createTestUser()
      mockRoute.query = { redirect: '/residents' }

      mockSignInWithGoogle.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { handleGoogleSignIn } = useLoginForm()

      await handleGoogleSignIn()

      expect(mockPush).toHaveBeenCalledWith('/residents')
    })

    it('should set loading to false after error', async () => {
      const authError = createUnknownAuthError('Error al iniciar sesión con Google')

      mockSignInWithGoogle.mockResolvedValue(Err(authError))

      const { handleGoogleSignIn, loading } = useLoginForm()

      await handleGoogleSignIn()

      expect(loading.value).toBe(false)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
