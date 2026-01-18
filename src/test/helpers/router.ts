import { vi } from 'vitest'
import { ref } from 'vue'
import { createRouter, createWebHistory, type Router, type RouteRecordRaw } from 'vue-router'

/**
 * Options for creating a test router
 */
export interface CreateTestRouterOptions {
  /**
   * Custom routes to add to the router
   * Default: Minimal routes for testing
   */
  routes?: RouteRecordRaw[]
  /**
   * Initial route path
   */
  initialRoute?: string
}

/**
 * Create a test router with default routes.
 * Useful for component tests that need routing functionality.
 *
 * @example
 * ```ts
 * const router = createTestRouter()
 * const router = createTestRouter({ initialRoute: '/dashboard' })
 * const router = createTestRouter({
 *   routes: [{ path: '/custom', component: MyComponent }]
 * })
 * ```
 */
export function createTestRouter(
  options: CreateTestRouterOptions = {}
): Router {
  const defaultRoutes: RouteRecordRaw[] = [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/signup', component: { template: '<div>SignUp</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    {
      path: '/residents',
      component: { template: '<div>Residents</div>' },
    },
    {
      path: '/residents/:id',
      component: { template: '<div>Resident Detail</div>' },
    },
  ]

  const routes = options.routes || defaultRoutes

  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // Navigate to initial route if provided
  if (options.initialRoute) {
    router.push(options.initialRoute).catch(() => {
      // Ignore navigation errors in tests
    })
  }

  return router
}

/**
 * Create a mock router for testing without actual navigation.
 * Useful when you only need router mocks, not real routing.
 */
export function createMockRouter(): Partial<Router> {
  return {
    push: vi.fn().mockResolvedValue(undefined),
    replace: vi.fn().mockResolvedValue(undefined),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: ref({
      path: '/',
      name: undefined,
      params: {},
      query: {},
      hash: '',
      fullPath: '/',
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    }) as any,
  }
}
