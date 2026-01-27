import type { RouteRecordRaw } from 'vue-router'

import LoginPage from '@/business/auth/presentation/pages/LoginPage.vue'
import SignUpPage from '@/business/auth/presentation/pages/SignUpPage.vue'

export const authRoutes: RouteRecordRaw[] = [
	{
		path: '/login',
		name: 'login',
		component: LoginPage,
	},
	{
		path: '/signup',
		name: 'signup',
		component: SignUpPage,
	},
]

export const emailVerificationRoutes: RouteRecordRaw[] = [
	{
		path: '/email-verification-required',
		name: 'email-verification-required',
		component: () => import('@/business/auth/presentation/pages/EmailVerificationRequiredPage.vue'),
		meta: { requiresAuth: true },
	},
]
