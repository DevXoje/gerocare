import type { User } from "@/business/auth/domain/User"

export interface AuthComposable {
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
}
