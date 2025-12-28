import type { AuthRepository } from "@/business/auth/domain/AuthRepository"
import type { User } from "@/business/auth/domain/User";

export const createAuthRepository = (): AuthRepository => {
  const auth: any = undefined;
  async function signIn(email: string, password: string): Promise<void> {
    const user = await auth.signInWithEmailAndPassword(email, password)
    return user
  }

  async function signUp(email: string, password: string): Promise<void> {
    const user = await auth.createUserWithEmailAndPassword(email, password)
    return user
  }

  async function signOut(): Promise<void> {
    await auth.signOut()
  }

  async function getCurrentUser(): Promise<User | null> {
    return auth.currentUser
  }
  return {
    signIn,
    signUp,
    signOut,
    getCurrentUser,
  }
}
