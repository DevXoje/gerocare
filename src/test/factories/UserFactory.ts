import { faker } from '@faker-js/faker'
import type { User as FirebaseUser } from 'firebase/auth'
import { vi } from 'vitest'

import type { User } from '@/business/auth/domain/User'

/**
 * Type for the builder object returned by createUserFactory
 */
export type UserFactoryBuilder = {
  withId: (uid: string) => UserFactoryBuilder
  withEmail: (email: string) => UserFactoryBuilder
  withDisplayName: (displayName: string) => UserFactoryBuilder
  withPhotoURL: (photoURL: string | null) => UserFactoryBuilder
  withEmailVerified: (verified: boolean) => UserFactoryBuilder
  withAnonymous: (isAnonymous: boolean) => UserFactoryBuilder
  build: (overrides?: Partial<FirebaseUser>) => FirebaseUser
  buildDomainUser: (overrides?: Partial<User>) => User
}

/**
 * Create a factory builder for creating test Firebase User objects.
 * Uses builder pattern for flexible test data generation.
 *
 * @example
 * ```ts
 * // Create with defaults
 * const user = createUserFactory().build()
 *
 * // Create with specific email
 * const user = createUserFactory().withEmail('test@example.com').build()
 *
 * // Create as domain User
 * const domainUser = createUserFactory().buildDomainUser()
 * ```
 */
export function createUserFactory(
  overrides?: Partial<FirebaseUser>
): UserFactoryBuilder {
  let user: Partial<FirebaseUser> = { ...overrides }

  const builder: UserFactoryBuilder = {
    withId(uid: string) {
      user = { ...user, uid }
      return builder
    },

    withEmail(email: string) {
      user = { ...user, email }
      return builder
    },

    withDisplayName(displayName: string) {
      user = { ...user, displayName }
      return builder
    },

    withPhotoURL(photoURL: string | null) {
      user = { ...user, photoURL }
      return builder
    },

    withEmailVerified(verified: boolean) {
      user = { ...user, emailVerified: verified }
      return builder
    },

    withAnonymous(isAnonymous: boolean) {
      user = { ...user, isAnonymous }
      return builder
    },

    build(overrides?: Partial<FirebaseUser>): FirebaseUser {
      const defaultUser = {
        uid: user.uid || faker.string.uuid(),
        email: user.email || faker.internet.email(),
        displayName: user.displayName || faker.person.fullName(),
        photoURL: user.photoURL ?? null,
        emailVerified: user.emailVerified ?? false,
      }

      return {
        uid: defaultUser.uid,
        email: defaultUser.email,
        displayName: defaultUser.displayName,
        photoURL: defaultUser.photoURL,
        emailVerified: defaultUser.emailVerified,
        isAnonymous: user.isAnonymous ?? false,
        metadata: {
          creationTime: user.metadata?.creationTime || Date.now().toString(),
          lastSignInTime:
            user.metadata?.lastSignInTime || Date.now().toString(),
        },
        providerData: user.providerData || [],
        refreshToken: user.refreshToken || 'test-refresh-token',
        tenantId: user.tenantId || null,
        delete: vi.fn().mockResolvedValue(undefined),
        getIdToken: vi.fn().mockResolvedValue('test-id-token'),
        getIdTokenResult: vi.fn().mockResolvedValue({} as any),
        reload: vi.fn().mockResolvedValue(undefined),
        toJSON: vi.fn().mockReturnValue({}),
        ...overrides,
      } as FirebaseUser
    },

    buildDomainUser(overrides?: Partial<User>): User {
      const firebaseUser = builder.build()
      return {
        uid: overrides?.uid || firebaseUser.uid,
        email: overrides?.email || firebaseUser.email,
        displayName: overrides?.displayName || firebaseUser.displayName,
        photoURL: overrides?.photoURL ?? firebaseUser.photoURL,
        emailVerified: overrides?.emailVerified ?? firebaseUser.emailVerified,
      }
    },
  }

  return builder
}

/**
 * Legacy object-style API for backwards compatibility.
 * Use createUserFactory() directly instead.
 */
export const UserFactory = {
  create: createUserFactory,
}

/**
 * Legacy function for backwards compatibility.
 * @deprecated Use createUserFactory().build() instead
 */
export function createTestUser(
  overrides?: Partial<FirebaseUser>
): FirebaseUser {
  return createUserFactory(overrides).build()
}
