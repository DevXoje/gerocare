import type { Result } from '@/shared/domain/Result'
import type { AuthError } from './AuthErrors'
import type { User } from '@/business/auth/domain/User'

export interface AuthComposable {
  signIn(email: string, password: string): Promise<Result<User, AuthError>>
  signOut(): Promise<Result<void, AuthError>>
}
