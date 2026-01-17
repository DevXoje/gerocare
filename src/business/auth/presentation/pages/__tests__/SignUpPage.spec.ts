import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import SignUpPage from '../SignUpPage.vue'

// Mock useSignUpForm
const mockEmail = ref('')
const mockPassword = ref('')
const mockPasswordConfirmation = ref('')
const mockLoading = ref(false)
const mockHandleSubmit = vi.fn()
const mockHandleGoogleSignIn = vi.fn()

vi.mock('@/business/auth/app/useSignUpForm', () => ({
  useSignUpForm: () => ({
    email: mockEmail,
    password: mockPassword,
    passwordConfirmation: mockPasswordConfirmation,
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

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmail.value = ''
    mockPassword.value = ''
    mockPasswordConfirmation.value = ''
    mockLoading.value = false
  })

  it('should render sign up form with all fields', async () => {
    mockLoading.value = false
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const passwordConfirmationInput = wrapper.find('#password-confirmation')

    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(passwordConfirmationInput.exists()).toBe(true)
  })

  it('should call handleSubmit when form is submitted', async () => {
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
  })

  it('should show loading state during sign up', async () => {
    mockLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 0))
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('[data-testid="sign-up-submit-button"]')

    expect(submitButton.classes()).toContain('button--disabled')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should display link to login page', () => {
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })

    const loginLink = wrapper.find('[data-testid="login-link"]')

    expect(loginLink.exists()).toBe(true)
    expect(loginLink.text()).toContain('Inicia sesión')
  })

  it('should not disable submit button when not loading', async () => {
    mockLoading.value = false
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('[data-testid="sign-up-submit-button"]')

    expect(submitButton.classes()).not.toContain('button--disabled')
  })

  it('should render Google sign up button', async () => {
    mockLoading.value = false
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const googleButton = wrapper.find('[data-testid="google-sign-up-button"]')

    expect(googleButton.exists()).toBe(true)
    expect(googleButton.text()).toContain('Google')
  })

  it('should call handleGoogleSignIn when Google button is clicked', async () => {
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const googleButton = wrapper.find('[data-testid="google-sign-up-button"]')
    await googleButton.trigger('click')

    expect(mockHandleGoogleSignIn).toHaveBeenCalledTimes(1)
  })

  it('should show loading state on Google button during sign up', async () => {
    mockLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 0))
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })
    await wrapper.vm.$nextTick()

    const googleButton = wrapper.find('[data-testid="google-sign-up-button"]')

    expect(googleButton.classes()).toContain('button--disabled')
    expect(googleButton.attributes('disabled')).toBeDefined()
  })

  it('should display separator between form and Google button', () => {
    const wrapper = mount(SignUpPage, {
      global: {
        plugins: [router],
      },
    })

    const separator = wrapper.find('[data-testid="signup-separator"]')

    expect(separator.exists()).toBe(true)
  })
})
