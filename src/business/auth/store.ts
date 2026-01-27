import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'

import type { User } from '@/business/auth/domain/User'

export const useAuthStore = defineStore('auth', () => {
	// Integrar VueFire's useCurrentUser para sincronización automática con Firebase
	const firebaseUser = useCurrentUser()

	// Computed que mapea el usuario de Firebase a nuestro dominio User
	const user = computed<User | null>(() => {
		if (!firebaseUser.value) {
			return null
		}

		return {
			uid: firebaseUser.value.uid,
			email: firebaseUser.value.email,
			displayName: firebaseUser.value.displayName,
			photoURL: firebaseUser.value.photoURL,
			emailVerified: firebaseUser.value.emailVerified,
		}
	})

	// Getter para verificar si el usuario está autenticado
	const isAuthenticated = computed(() => user.value !== null)

	// Getter para verificar si el email está verificado
	const isEmailVerified = computed(() => user.value?.emailVerified ?? false)

	return {
		user,
		isAuthenticated,
		isEmailVerified,
	}
})
