import ResidentsPage from './presentation/pages/ResidentsPage.vue'
import ResidentDetailPage from './presentation/pages/ResidentDetailPage.vue'
import type { RouteRecordRaw } from 'vue-router'

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

