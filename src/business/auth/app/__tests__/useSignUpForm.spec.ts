import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSignUpForm } from '../useSignUpForm'
import { Ok, Err } from '@/shared/domain/Result'
import { createTestUser } from '@/test/helpers/auth'
import { createEmailAlreadyInUseError, createWeakPasswordError, createUnknownAuthError } from '@/business/auth/domain/AuthErrors'

// Mock useAuth
const mockSignUp = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockSendVerificationEmail = vi.fn()

vi.mock('../useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    sendVerificationEmail: mockSendVerificationEmail,
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
const mockInfo = vi.fn()

vi.mock('@/shared/composables/useNotifications', () => ({
  useNotifications: () => ({
    error: mockError,
    success: mockSuccess,
    warning: vi.fn(),
    info: mockInfo,
  }),
}))

describe('useSignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = {}
    // Default mock for sendVerificationEmail to return success
    mockSendVerificationEmail.mockResolvedValue(Ok(undefined))
  })

  describe('handleSubmit', () => {
    it('should call signUp when handleSubmit is called', async () => {
      const testUser = createTestUser({
        uid: 'new-user-123',
        email: 'newuser@example.com',
      })

      mockSignUp.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'newuser@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(mockSignUp).toHaveBeenCalledTimes(1)
      expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
    })

    it('should validate email format', async () => {
      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'invalid-email'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(mockSignUp).not.toHaveBeenCalled()
      expect(mockError).toHaveBeenCalledWith('Por favor, ingresa un email válido')
    })

    it('should validate password strength (minimum 6 characters)', async () => {
      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = '12345'
      passwordConfirmation.value = '12345'

      await handleSubmit()

      expect(mockSignUp).not.toHaveBeenCalled()
      expect(mockError).toHaveBeenCalledWith('La contraseña debe tener al menos 6 caracteres')
    })

    it('should validate password confirmation matches', async () => {
      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'differentpassword'

      await handleSubmit()

      expect(mockSignUp).not.toHaveBeenCalled()
      expect(mockError).toHaveBeenCalledWith('Las contraseñas no coinciden')
    })

    it('should set loading to true during sign up', async () => {
      const testUser = createTestUser()

      mockSignUp.mockImplementation(() =>
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

      const { email, password, passwordConfirmation, loading, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      const promise = handleSubmit()
      expect(loading.value).toBe(true)

      await promise
    })

    it('should set loading to false after sign up completes', async () => {
      const testUser = createTestUser()

      mockSignUp.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { email, password, passwordConfirmation, loading, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(loading.value).toBe(false)
    })

    it('should show success notification on successful sign up', async () => {
      const testUser = createTestUser()

      mockSignUp.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(mockSuccess).toHaveBeenCalledWith('Cuenta creada correctamente')
    })

    it('should show error notification on failed sign up', async () => {
      const authError = createEmailAlreadyInUseError('El email ya está en uso')

      mockSignUp.mockResolvedValue(Err(authError))

      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'existing@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(mockError).toHaveBeenCalledWith('El email ya está en uso')
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('should redirect to dashboard on successful sign up', async () => {
      const testUser = createTestUser()

      mockSignUp.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should send email verification after successful sign up', async () => {
      const testUser = createTestUser({
        uid: 'new-user-123',
        email: 'test@example.com',
      })

      mockSignUp.mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )
      mockSendVerificationEmail.mockResolvedValue(Ok(undefined))

      const { email, password, passwordConfirmation, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1)
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        uid: 'new-user-123',
        email: 'test@example.com',
        displayName: testUser.displayName,
        photoURL: testUser.photoURL,
        emailVerified: testUser.emailVerified,
      })
    })

    it('should set loading to false after error', async () => {
      const authError = createWeakPasswordError('La contraseña es demasiado débil')

      mockSignUp.mockResolvedValue(Err(authError))

      const { email, password, passwordConfirmation, loading, handleSubmit } = useSignUpForm()
      email.value = 'test@example.com'
      password.value = 'password123'
      passwordConfirmation.value = 'password123'

      await handleSubmit()

      expect(loading.value).toBe(false)
      expect(mockPush).not.toHaveBeenCalled()
    })
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

      const { handleGoogleSignIn } = useSignUpForm()

      await handleGoogleSignIn()

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('should set loading to true during Google sign in', async () => {
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

      const { handleGoogleSignIn, loading } = useSignUpForm()

      const promise = handleGoogleSignIn()
      expect(loading.value).toBe(true)

      await promise
    })

    it('should set loading to false after Google sign in completes', async () => {
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

      const { handleGoogleSignIn, loading } = useSignUpForm()

      await handleGoogleSignIn()

      expect(loading.value).toBe(false)
    })

    it('should show success notification on successful Google sign in', async () => {
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

      const { handleGoogleSignIn } = useSignUpForm()

      await handleGoogleSignIn()

      expect(mockSuccess).toHaveBeenCalledWith('Cuenta creada correctamente')
    })

    it('should show error notification on failed Google sign in', async () => {
      const authError = createUnknownAuthError('Error al iniciar sesión con Google')

      mockSignInWithGoogle.mockResolvedValue(Err(authError))

      const { handleGoogleSignIn } = useSignUpForm()

      await handleGoogleSignIn()

      expect(mockError).toHaveBeenCalledWith('Error al iniciar sesión con Google')
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('should redirect to dashboard on successful Google sign in', async () => {
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

      const { handleGoogleSignIn } = useSignUpForm()

      await handleGoogleSignIn()

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should set loading to false after Google sign in error', async () => {
      const authError = createUnknownAuthError('Error al iniciar sesión con Google')

      mockSignInWithGoogle.mockResolvedValue(Err(authError))

      const { handleGoogleSignIn, loading } = useSignUpForm()

      await handleGoogleSignIn()

      expect(loading.value).toBe(false)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
