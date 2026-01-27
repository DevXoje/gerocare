import type { RouteRecordRaw } from 'vue-router'

import CarePlansPage from '@/business/care-plans/presentation/pages/CarePlansPage.vue'

export const carePlansRoutes: RouteRecordRaw[] = [
	{
		path: '/care-plans',
		name: 'care-plans',
		component: CarePlansPage,
		meta: {
			requiresAuth: true,
			requiresEmailVerification: true,
			title: 'Planes de Atención Individual (PAI)',
		},
	},
	{
		path: '/residents/:residentId/care-plans',
		name: 'resident-care-plans',
		component: CarePlansPage,
		meta: {
			requiresAuth: true,
			requiresEmailVerification: true,
			title: 'Planes de Atención Individual (PAI)',
		},
	},
]
