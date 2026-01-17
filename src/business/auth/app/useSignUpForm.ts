import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

export const useSignUpForm = () => {
  const router = useRouter()
  const route = useRoute()
  const { signUp, signInWithGoogle, sendVerificationEmail } = useAuth()
  const notifications = useNotifications()

  const email = ref('')
  const password = ref('')
  const passwordConfirmation = ref('')
  const loading = ref(false)

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }

  const validatePassword = (passwordValue: string): boolean => {
    return passwordValue.length >= 6
  }

  const validatePasswordConfirmation = (passwordValue: string, confirmationValue: string): boolean => {
    return passwordValue === confirmationValue
  }

  const validateFields = (): { valid: boolean; error?: string } => {
    if (!email.value || !password.value || !passwordConfirmation.value) {
      return { valid: false, error: 'Por favor, completa todos los campos' }
    }

    if (!validateEmail(email.value)) {
      return { valid: false, error: 'Por favor, ingresa un email válido' }
    }

    if (!validatePassword(password.value)) {
      return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    if (!validatePasswordConfirmation(password.value, passwordConfirmation.value)) {
      return { valid: false, error: 'Las contraseñas no coinciden' }
    }

    return { valid: true }
  }

  const handleSubmit = async () => {
    const validation = validateFields()
    if (!validation.valid) {
      notifications.error(validation.error || 'Error de validación')
      return
    }

    loading.value = true

    try {
      const result = await signUp(email.value, password.value)

      if (!result.success) {
        notifications.error(result.error.message)
        loading.value = false
        return
      }

      // Send email verification
      const verificationResult = await sendVerificationEmail(result.value)
      if (verificationResult.success) {
        notifications.info('Se ha enviado un email de verificación a tu correo')
      }

      notifications.success('Cuenta creada correctamente')

      // Redirect to dashboard (user is automatically signed in after sign up)
      const redirect = (route.query.redirect as string) || '/dashboard'
      router.push(redirect)

      loading.value = false
    } catch (error) {
      loading.value = false
      throw error
    }
  }

  const handleGoogleSignIn = async () => {
    loading.value = true

    try {
      const result = await signInWithGoogle()

      if (!result.success) {
        notifications.error(result.error.message)
        loading.value = false
        return
      }

      notifications.success('Cuenta creada correctamente')

      // Redirect to dashboard or the original destination
      const redirect = (route.query.redirect as string) || '/dashboard'
      router.push(redirect)

      loading.value = false
    } catch (error) {
      loading.value = false
      throw error
    }
  }

  return {
    email,
    password,
    passwordConfirmation,
    loading,
    handleSubmit,
    handleGoogleSignIn,
  }
}
