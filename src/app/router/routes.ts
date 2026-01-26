import type { RouteRecordRaw } from 'vue-router'

import { activityLogsRoutes } from '@/business/activity-logs/routes'
import { authRoutes } from '@/business/auth/routes'
import { carePlansRoutes } from '@/business/care-plans/routes'
import PrivateLayout from '@design-system/layouts/PrivateLayout.vue'
import PublicLayout from '@design-system/layouts/PublicLayout.vue'
import { dashboardRoutes } from '@/business/dashboard/routes'
import { incidentRoutes } from '@/business/incidents/routes'
import { medicationRoutes } from '@/business/medication/routes'
import { reportsRoutes } from '@/business/reports/routes'
import { residentRoutes } from '@/business/residents/routes'
import { shiftRoutes } from '@/business/shifts/routes'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		redirect: '/dashboard',
	},
	{
		path: '/',
		component: PublicLayout,
		children: authRoutes,
	},
	{
		path: '/',
		component: PrivateLayout,
		children: [
			...dashboardRoutes,
			...residentRoutes,
			...medicationRoutes,
			...carePlansRoutes,
			...incidentRoutes,
			...activityLogsRoutes,
			...shiftRoutes,
			...reportsRoutes,
		],
	},
]
