import { createRouter, createWebHistory } from 'vue-router'

import { authGuard } from '@/business/auth/routes/guards/authGuard'
import { emailVerificationGuard } from '@/business/auth/routes/guards/emailVerificationGuard'
import { routes } from '@/app/router/routes'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

router.beforeEach(authGuard)
router.beforeEach(emailVerificationGuard)

export default router
