import type { User as FirebaseUser } from 'firebase/auth'
import { vi } from 'vitest'

/**
 * Factory function to create a test Firebase User with default values
 */
export function createTestUser(overrides?: Partial<FirebaseUser>): FirebaseUser {
  const defaultUser = {
    uid: overrides?.uid || 'test-user-123',
    email: overrides?.email || 'test@example.com',
    displayName: overrides?.displayName || 'Test User',
    photoURL: overrides?.photoURL || null,
    emailVerified: overrides?.emailVerified ?? false,
  }

  return {
    uid: defaultUser.uid,
    email: defaultUser.email,
    displayName: defaultUser.displayName,
    photoURL: defaultUser.photoURL,
    emailVerified: defaultUser.emailVerified,
    phoneNumber: overrides?.phoneNumber ?? null,
    providerId: overrides?.providerId ?? 'firebase',
    isAnonymous: false,
    metadata: {
      creationTime: Date.now().toString(),
      lastSignInTime: Date.now().toString(),
    },
    providerData: [],
    refreshToken: 'test-refresh-token',
    tenantId: null,
    delete: vi.fn().mockResolvedValue(undefined),
    getIdToken: vi.fn().mockResolvedValue('test-id-token'),
    getIdTokenResult: vi.fn().mockResolvedValue({} as any),
    reload: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn().mockReturnValue({}),
  } as FirebaseUser
}
