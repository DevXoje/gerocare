import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUnknownAuthError } from '@/business/auth/domain/AuthErrors'
import type { AuthRepository } from '@/business/auth/domain/AuthRepository'
import { Err,Ok } from '@/shared/domain/Result'
import { createTestUser } from '@/test/helpers/auth'

import { useAuth } from '../useAuth'

// Mock the repository
vi.mock('@/business/auth/infrastructure/FirestoreAuth', () => ({
  createAuthRepository: vi.fn(),
}))

describe('useAuth', () => {
  let mockRepository: Partial<AuthRepository>

  beforeEach(async () => {
    const { createAuthRepository } = await import('@/business/auth/infrastructure/FirestoreAuth')

    mockRepository = {
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    }

    vi.mocked(createAuthRepository).mockReturnValue(mockRepository as AuthRepository)
  })

  describe('signInWithGoogle', () => {
    it('should call repository signInWithGoogle', async () => {
      const testUser = createTestUser({
        uid: 'google-user-123',
        email: 'user@gmail.com',
      })

      mockRepository.signInWithGoogle = vi.fn().mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { signInWithGoogle } = useAuth()

      await signInWithGoogle()

      expect(mockRepository.signInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('should return success result on successful sign in', async () => {
      const testUser = createTestUser({
        uid: 'google-user-123',
        email: 'user@gmail.com',
        displayName: 'John Doe',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
      })

      mockRepository.signInWithGoogle = vi.fn().mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { signInWithGoogle } = useAuth()

      const result = await signInWithGoogle()

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.value.uid).toBe('google-user-123')
      expect(result.value.email).toBe('user@gmail.com')
      expect(result.value.displayName).toBe('John Doe')
    })

    it('should return error result on failed sign in', async () => {
      const authError = createUnknownAuthError('Error al iniciar sesión con Google')

      mockRepository.signInWithGoogle = vi.fn().mockResolvedValue(Err(authError))

      const { signInWithGoogle } = useAuth()

      const result = await signInWithGoogle()

      expect(result.success).toBe(false)
      if (result.success) return
      expect(result.error.type).toBe('UNKNOWN')
      expect(result.error.message).toContain('Google')
    })
  })

  describe('signUp', () => {
    it('should call repository signUp', async () => {
      const testUser = createTestUser({
        uid: 'new-user-123',
        email: 'newuser@example.com',
      })

      mockRepository.signUp = vi.fn().mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { signUp } = useAuth()

      await signUp('newuser@example.com', 'password123')

      expect(mockRepository.signUp).toHaveBeenCalledTimes(1)
      expect(mockRepository.signUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
    })

    it('should return success result on successful sign up', async () => {
      const testUser = createTestUser({
        uid: 'new-user-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        photoURL: null,
        emailVerified: false,
      })

      mockRepository.signUp = vi.fn().mockResolvedValue(
        Ok({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          photoURL: testUser.photoURL,
          emailVerified: testUser.emailVerified,
        })
      )

      const { signUp } = useAuth()

      const result = await signUp('newuser@example.com', 'password123')

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.value.uid).toBe('new-user-123')
      expect(result.value.email).toBe('newuser@example.com')
      expect(result.value.emailVerified).toBe(false)
    })

    it('should return error result on failed sign up', async () => {
      const authError = createUnknownAuthError('Error al registrarse')

      mockRepository.signUp = vi.fn().mockResolvedValue(Err(authError))

      const { signUp } = useAuth()

      const result = await signUp('test@example.com', 'password123')

      expect(result.success).toBe(false)
      if (result.success) return
      expect(result.error.type).toBe('UNKNOWN')
      expect(result.error.message).toContain('registrarse')
    })
  })
})
