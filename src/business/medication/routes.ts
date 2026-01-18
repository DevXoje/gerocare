import type { RouteRecordRaw } from 'vue-router'

import MedicationPage from './presentation/pages/MedicationPage.vue'

export const medicationRoutes: RouteRecordRaw[] = [
  {
    path: '/medications',
    name: 'medications',
    component: MedicationPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/residents/:id/medications',
    name: 'resident-medications',
    component: MedicationPage,
    meta: { requiresAuth: true },
  },
]
