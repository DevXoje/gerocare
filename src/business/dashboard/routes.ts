import type { RouteRecordRaw } from "vue-router";

import DashboardPage from "@/business/dashboard/presentation/pages/DashboardPage.vue";

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
]
