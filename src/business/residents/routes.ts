import type { RouteRecordRaw } from 'vue-router'

import ResidentDetailPage from './presentation/pages/ResidentDetailPage.vue'
import ResidentsPage from './presentation/pages/ResidentsPage.vue'

export const residentRoutes: RouteRecordRaw[] = [
  {
    path: '/residents',
    name: 'residents',
    component: ResidentsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/residents/:id',
    name: 'resident-detail',
    component: ResidentDetailPage,
    meta: { requiresAuth: true },
  },
]

