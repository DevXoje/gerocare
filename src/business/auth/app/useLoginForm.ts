import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/business/auth/app/useAuth'
import { createLoginFormSchema } from '@/business/auth/domain/LoginForm.schema'
import { useI18n } from '@/shared/i18n'
import { useNotifications } from '@/shared/composables/useNotifications'
import { getZodErrorMessage } from '@/shared/validation/zodErrorMapper'

export const useLoginForm = () => {
	const router = useRouter()
	const route = useRoute()
	const { signIn, signInWithGoogle } = useAuth()
	const notifications = useNotifications()
	const { t } = useI18n()

	const email = ref('')
	const password = ref('')
	const loading = ref(false)

	const handleAuthResult = async (
		authPromise: Promise<{ success: boolean; error?: { message: string } }>
	) => {
		loading.value = true

		try {
			const result = await authPromise

			if (!result.success) {
				notifications.error(result.error.message)
				loading.value = false
				return
			}

			notifications.success(t('auth.login.success'))

			// Redirect to dashboard or the original destination
			const redirect = (route.query.redirect as string) || '/dashboard'
			router.push(redirect)

			loading.value = false
		} catch (error) {
			loading.value = false
			throw error
		}
	}

	const handleSubmit = async () => {
		// Validate form data with Zod
		const schema = createLoginFormSchema(t)
		const validation = schema.safeParse({
			email: email.value,
			password: password.value,
		})

		if (!validation.success) {
			const errorMessage = getZodErrorMessage(validation.error, t)
			notifications.error(errorMessage)
			return
		}

		await handleAuthResult(signIn(validation.data.email, validation.data.password))
	}

	const handleGoogleSignIn = async () => {
		await handleAuthResult(signInWithGoogle())
	}

	return {
		email,
		password,
		loading,
		handleSubmit,
		handleGoogleSignIn,
	}
}
