import LoginPage from "@/business/auth/presentation/pages/LoginPage.vue";
import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
]
