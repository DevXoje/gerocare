import type { RouteRecordRaw } from 'vue-router'

import ResidentDetailPage from '@/business/residents/presentation/pages/ResidentDetailPage.vue'
import ResidentsPage from '@/business/residents/presentation/pages/ResidentsPage.vue'

export const residentRoutes: RouteRecordRaw[] = [
	{
		path: '/residents',
		name: 'residents',
		component: ResidentsPage,
		meta: { requiresAuth: true, requiresEmailVerification: true },
	},
	{
		path: '/residents/:id',
		name: 'resident-detail',
		component: ResidentDetailPage,
		meta: { requiresAuth: true, requiresEmailVerification: true },
	},
]
