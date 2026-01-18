import { ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'

import { useNotifications } from '@/shared/composables/useNotifications'

import { SignUpFormSchema } from '../domain/SignUpForm.schema'

import { useAuth } from './useAuth'

export const useSignUpForm = () => {
  const router = useRouter()
  const route = useRoute()
  const { signUp, signInWithGoogle, sendVerificationEmail } = useAuth()
  const notifications = useNotifications()

  const email = ref('')
  const password = ref('')
  const passwordConfirmation = ref('')
  const loading = ref(false)

  const handleSubmit = async () => {
    // Validate form data with Zod
    const validation = SignUpFormSchema.safeParse({
      email: email.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    })

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      notifications.error(firstError?.message || 'Validation failed')
      return
    }

    loading.value = true

    try {
      const result = await signUp(validation.data.email, validation.data.password)

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
