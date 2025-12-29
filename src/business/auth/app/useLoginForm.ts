import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth'
import { useNotifications } from '@/shared/composables/useNotifications'

export const useLoginForm = () => {
  const router = useRouter()
  const route = useRoute()
  const { signIn } = useAuth()
  const notifications = useNotifications()

  const email = ref('')
  const password = ref('')
  const loading = ref(false)

  const handleSubmit = async () => {
    if (!email.value || !password.value) {
      notifications.error('Por favor, completa todos los campos')
      return
    }

    loading.value = true

    const result = await signIn(email.value, password.value)

    if (!result.success) {
      notifications.error(result.error.message)
      loading.value = false
      return
    }

    notifications.success('Sesión iniciada correctamente')

    // Redirect to dashboard or the original destination
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)

    loading.value = false
  }

  return {
    email,
    password,
    loading,
    handleSubmit,
  }
}

