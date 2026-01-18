import type { RouteRecordRaw } from 'vue-router'

import ShiftsPage from '@/business/shifts/presentation/pages/ShiftsPage.vue'

export const shiftRoutes: RouteRecordRaw[] = [
	{
		path: '/shifts',
		name: 'shifts',
		component: ShiftsPage,
		meta: {
			requiresAuth: true,
			title: 'Gestión de Turnos',
		},
	},
	{
		path: '/caregivers/:caregiverId/shifts',
		name: 'caregiver-shifts',
		component: ShiftsPage,
		meta: {
			requiresAuth: true,
			title: 'Gestión de Turnos',
		},
	},
]
