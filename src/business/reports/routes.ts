import type { RouteRecordRaw } from 'vue-router'

import ReportsPage from '@/business/reports/presentation/pages/ReportsPage.vue'

export const reportsRoutes: RouteRecordRaw[] = [
	{
		path: '/reports',
		name: 'reports',
		component: ReportsPage,
		meta: {
			requiresAuth: true,
			title: 'Reportes y Estadísticas',
		},
	},
]
