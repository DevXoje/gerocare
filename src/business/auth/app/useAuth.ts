import { useAuthStore } from "@/business/auth/store"
import { createAuthRepository } from "@/business/auth/infrastructure/FirestoreAuth"
import type { AuthComposable } from "@/business/auth/domain/AuthComposable"
export const useAuth = (): AuthComposable => {
  const store = useAuthStore()
  const repository = createAuthRepository()

  return {
    signIn: async (email: string, password: string) => {
      await repository.signIn(email, password)
      store.state.user = await repository.getCurrentUser()
    },
    signUp: async (email: string, password: string) => {
      await repository.signUp(email, password)
      store.state.user = await repository.getCurrentUser()
    },
    signOut: async () => {
      await repository.signOut()
      store.state.user = null
    },
    getCurrentUser: async () => {
      store.state.user ??= await repository.getCurrentUser();
      return store.state.user
    },
  }
}
