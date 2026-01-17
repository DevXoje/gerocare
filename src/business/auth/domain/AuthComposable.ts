import type { Result } from '@/shared/domain/Result'
import type { AuthError } from './AuthErrors'
import type { User } from '@/business/auth/domain/User'

export interface AuthComposable {
  signIn(email: string, password: string): Promise<Result<User, AuthError>>
  signInWithGoogle(): Promise<Result<User, AuthError>>
  signUp(email: string, password: string): Promise<Result<User, AuthError>>
  sendVerificationEmail(user: User): Promise<Result<void, AuthError>>
  signOut(): Promise<Result<void, AuthError>>
}
