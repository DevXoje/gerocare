import type { AuthError } from '@/business/auth/domain/AuthErrors'
import type { User } from '@/business/auth/domain/User'
import type { Result } from '@/shared/domain/Result'

export interface AuthComposable {
	signIn(email: string, password: string): Promise<Result<User, AuthError>>
	signInWithGoogle(): Promise<Result<User, AuthError>>
	signUp(email: string, password: string): Promise<Result<User, AuthError>>
	sendVerificationEmail(user: User): Promise<Result<void, AuthError>>
	reloadUser(): Promise<Result<User, AuthError>>
	signOut(): Promise<Result<void, AuthError>>
}
