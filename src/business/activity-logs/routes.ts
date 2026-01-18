import type { RouteRecordRaw } from 'vue-router'

import ActivityLogsPage from './presentation/pages/ActivityLogsPage.vue'

export const activityLogsRoutes: RouteRecordRaw[] = [
  {
    path: '/activity-logs',
    name: 'activity-logs',
    component: ActivityLogsPage,
    meta: {
      requiresAuth: true,
      title: 'Registro de Actividades',
    },
  },
  {
    path: '/residents/:residentId/activity-logs',
    name: 'resident-activity-logs',
    component: ActivityLogsPage,
    meta: {
      requiresAuth: true,
      title: 'Registro de Actividades',
    },
  },
]
