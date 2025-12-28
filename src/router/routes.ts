import { authRoutes } from '@/business/auth/routes';
import type { RouteRecordRaw } from 'vue-router';

export const routes:RouteRecordRaw[] = [
  ...authRoutes
];
