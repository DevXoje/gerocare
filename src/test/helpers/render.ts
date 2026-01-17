import { mount, type VueWrapper, type MountingOptions } from '@vue/test-utils'
import { createPinia, type Pinia } from 'pinia'
import type { Component } from 'vue'
import { createTestRouter, type CreateTestRouterOptions } from './router'
import type { Router } from 'vue-router'

/**
 * Options for rendering a component in tests
 */
export interface RenderOptions {
  /**
   * Props to pass to the component
   */
  props?: Record<string, any>
  /**
   * Global options for Vue Test Utils
   */
  global?: MountingOptions['global']
  /**
   * Whether to include Pinia store
   * Default: false
   */
  pinia?: boolean | Pinia
  /**
   * Whether to include Vue Router
   * Default: false
   * Can also pass router options or a router instance
   */
  router?: boolean | Router | CreateTestRouterOptions
  /**
   * Additional mounting options
   */
  [key: string]: any
}

/**
 * Render a Vue component with optional Pinia and Router setup.
 * This helper simplifies component testing by automatically configuring
 * common dependencies.
 *
 * @example
 * ```ts
 * // Simple component without dependencies
 * const wrapper = renderComponent(MyComponent, { props: { data } })
 *
 * // Component with Pinia
 * const wrapper = renderComponent(MyComponent, {
 *   props: { data },
 *   pinia: true
 * })
 *
 * // Component with Router
 * const wrapper = renderComponent(MyComponent, {
 *   props: { data },
 *   router: true
 * })
 *
 * // Component with both Pinia and Router
 * const wrapper = renderComponent(MyComponent, {
 *   props: { data },
 *   pinia: true,
 *   router: true
 * })
 *
 * // Custom Pinia instance
 * const customPinia = createPinia()
 * const wrapper = renderComponent(MyComponent, { pinia: customPinia })
 *
 * // Custom Router with options
 * const wrapper = renderComponent(MyComponent, {
 *   router: { initialRoute: '/dashboard' }
 * })
 * ```
 */
export function renderComponent<T = any>(
  component: Component,
  options: RenderOptions = {}
): VueWrapper<T> {
  const {
    props = {},
    global = {},
    pinia: usePinia = false,
    router: useRouter = false,
    ...mountingOptions
  } = options

  const plugins = [...(global.plugins || [])]

  // Setup Pinia
  let piniaInstance: Pinia | undefined
  if (usePinia) {
    if (usePinia === true) {
      piniaInstance = createPinia()
    } else {
      piniaInstance = usePinia
    }
    plugins.push(piniaInstance)
  }

  // Setup Router
  let routerInstance: Router | undefined
  if (useRouter) {
    if (useRouter === true) {
      routerInstance = createTestRouter()
    } else if ('push' in useRouter || 'currentRoute' in useRouter) {
      // It's a Router instance
      routerInstance = useRouter as Router
    } else {
      // It's CreateTestRouterOptions
      routerInstance = createTestRouter(useRouter as CreateTestRouterOptions)
    }
    plugins.push(routerInstance)
  }

  return mount(component, {
    props,
    global: {
      ...global,
      plugins,
    },
    ...mountingOptions,
  } as MountingOptions<any>)
}
