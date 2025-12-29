import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'
import { authGuard } from '@/router/guards/authGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(authGuard)

export default router
