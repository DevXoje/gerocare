import { createAuthRepository } from '@/business/auth/infrastructure/FirestoreAuth'
import type { AuthComposable } from '@/business/auth/domain/AuthComposable'

export const useAuth = (): AuthComposable => {
  const repository = createAuthRepository()

  async function signIn(email: string, password: string) {
    const result = await repository.signIn(email, password)
    // VueFire automatically updates the user state in the store via useCurrentUser() on success
    return result
  }

  async function signOut() {
    const result = await repository.signOut()
    // VueFire automatically updates the user state in the store via useCurrentUser() on success
    return result
  }

  return {
    signIn,
    signOut,
  }
}
