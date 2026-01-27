import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/business/auth/app/useAuth'
import { createSignUpFormSchema } from '@/business/auth/domain/SignUpForm.schema'
import { useI18n } from '@/shared/i18n'
import { useNotifications } from '@/shared/composables/useNotifications'
import { getZodErrorMessage } from '@/shared/validation/zodErrorMapper'

export const useSignUpForm = () => {
	const router = useRouter()
	const route = useRoute()
	const { signUp, signInWithGoogle, sendVerificationEmail } = useAuth()
	const notifications = useNotifications()
	const { t } = useI18n()

	const email = ref('')
	const password = ref('')
	const passwordConfirmation = ref('')
	const loading = ref(false)

	const handleSubmit = async () => {
		// Validate form data with Zod
		const schema = createSignUpFormSchema(t)
		const validation = schema.safeParse({
			email: email.value,
			password: password.value,
			passwordConfirmation: passwordConfirmation.value,
		})

		if (!validation.success) {
			const errorMessage = getZodErrorMessage(validation.error, t)
			notifications.error(errorMessage)
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
				notifications.info(t('auth.signup.verificationEmailSent'))
			}

			notifications.success(t('auth.signup.success'))

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

			notifications.success(t('auth.signup.success'))

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
