import PublicLayout from '@/presentation/layouts/PublicLayout.vue'
import PrivateLayout from '@/presentation/layouts/PrivateLayout.vue'
import { authRoutes } from '@/business/auth/routes'
import { dashboardRoutes } from '@/business/dashboard/routes'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: PublicLayout,
    children: authRoutes
  },
  {
    path: '/',
    component: PrivateLayout,
    children: dashboardRoutes
  }
]
