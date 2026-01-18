import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { useAuthStore } from '@/business/auth/store'
import { auth } from '@/infrastructure/firebase/firebase.config'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Wait for auth to be ready (Firebase initialization)
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe()
        resolve(undefined)
      })
    })

    // Get user from Pinia store (which is synced with VueFire)
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Allow navigation
  next()
}

