import type { RouteRecordRaw } from 'vue-router'

import ProfilePage from '@/business/profile/presentation/pages/ProfilePage.vue'

export const profileRoutes: RouteRecordRaw[] = [
	{
		path: '/profile',
		name: 'profile',
		component: ProfilePage,
		meta: { requiresAuth: true },
	},
]
