import type { RouteRecordRaw } from 'vue-router'

import IncidentsPage from './presentation/pages/IncidentsPage.vue'

export const incidentRoutes: RouteRecordRaw[] = [
  {
    path: '/incidents',
    name: 'incidents',
    component: IncidentsPage,
    meta: {
      requiresAuth: true,
      title: 'Registro de Incidencias',
    },
  },
  {
    path: '/residents/:residentId/incidents',
    name: 'resident-incidents',
    component: IncidentsPage,
    meta: {
      requiresAuth: true,
      title: 'Registro de Incidencias',
    },
  },
]
