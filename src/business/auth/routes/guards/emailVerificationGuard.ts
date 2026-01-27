import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { useAuthStore } from '@/business/auth/store'

export const emailVerificationGuard = async (
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext
) => {
	// Check if route requires email verification
	if (to.meta.requiresEmailVerification) {
		const authStore = useAuthStore()

		// If user is not authenticated, authGuard will handle it
		if (!authStore.isAuthenticated) {
			next()
			return
		}

		// Check if email is verified
		if (!authStore.user?.emailVerified) {
			// Redirect to email verification required page
			next({
				name: 'email-verification-required',
				query: { redirect: to.fullPath },
			})
			return
		}
	}

	// Allow navigation
	next()
}
