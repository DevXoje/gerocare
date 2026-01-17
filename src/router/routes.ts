import PublicLayout from '@/business/common/presentation/layouts/PublicLayout.vue'
import PrivateLayout from '@/business/common/presentation/layouts/PrivateLayout.vue'
import { authRoutes } from '@/business/auth/routes'
import { dashboardRoutes } from '@/business/dashboard/routes'
import { residentRoutes } from '@/business/residents/routes'
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
    children: [...dashboardRoutes, ...residentRoutes]
  }
]
