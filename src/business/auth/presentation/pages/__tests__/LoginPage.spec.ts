import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../LoginPage.vue'

// Mock useLoginForm
const mockEmail = ref('')
const mockPassword = ref('')
const mockLoading = ref(false)
const mockHandleSubmit = vi.fn()
const mockHandleGoogleSignIn = vi.fn()

vi.mock('@/business/auth/app/useLoginForm', () => ({
  useLoginForm: () => ({
    email: mockEmail,
    password: mockPassword,
    loading: mockLoading,
    handleSubmit: mockHandleSubmit,
    handleGoogleSignIn: mockHandleGoogleSignIn,
  }),
}))

// Create router for tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/signup', name: 'signup', component: { template: '<div>SignUp</div>' } },
  ],
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmail.value = ''
    mockPassword.value = ''
    mockLoading.value = false
  })

  it('should render Google sign in button', async () => {
    mockLoading.value = false
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const googleButton = wrapper.find('[data-testid="google-sign-in-button"]')

    expect(googleButton.exists()).toBe(true)
    expect(googleButton.text()).toContain('Google')
  })

  it('should call handleGoogleSignIn when Google button is clicked', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    })

    const googleButton = wrapper.find('[data-testid="google-sign-in-button"]')
    await googleButton.trigger('click')

    expect(mockHandleGoogleSignIn).toHaveBeenCalledTimes(1)
  })

  it('should show loading state on Google button during sign in', async () => {
    mockLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 0))
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const googleButton = wrapper.find('[data-testid="google-sign-in-button"]')

    expect(googleButton.classes()).toContain('button--disabled')
    expect(googleButton.attributes('disabled')).toBeDefined()
  })

  it('should display separator between email form and Google button', () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    })

    const separator = wrapper.find('[data-testid="login-separator"]')

    expect(separator.exists()).toBe(true)
  })

  it('should not disable Google button when not loading', async () => {
    mockLoading.value = false
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const googleButton = wrapper.find('[data-testid="google-sign-in-button"]')

    expect(googleButton.classes()).not.toContain('button--disabled')
  })
})
