import type { AuthComposable } from '@/business/auth/domain/AuthComposable'
import type { User } from '@/business/auth/domain/User'
import { createAuthRepository } from '@/business/auth/infrastructure/FirestoreAuth'
import { useI18n } from '@/shared/i18n'

export const useAuth = (): AuthComposable => {
	const { t } = useI18n()
	const repository = createAuthRepository(t)

	async function signIn(email: string, password: string) {
		const result = await repository.signIn(email, password)
		// VueFire automatically updates the user state in the store via useCurrentUser() on success
		return result
	}

	async function signInWithGoogle() {
		const result = await repository.signInWithGoogle()
		// VueFire automatically updates the user state in the store via useCurrentUser() on success
		return result
	}

	async function signUp(email: string, password: string) {
		const result = await repository.signUp(email, password)
		// VueFire automatically updates the user state in the store via useCurrentUser() on success
		return result
	}

	async function sendVerificationEmail(user: User) {
		const result = await repository.sendVerificationEmail(user)
		return result
	}

	async function reloadUser() {
		const result = await repository.reloadUser()
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
		signInWithGoogle,
		signUp,
		sendVerificationEmail,
		reloadUser,
		signOut,
	}
}
