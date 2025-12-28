import DashboardPage from "@/business/dashboard/presentation/pages/DashboardPage.vue";
import type { RouteRecordRaw } from "vue-router";

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage
  },
]
