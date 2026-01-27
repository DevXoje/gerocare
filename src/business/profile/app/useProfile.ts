import { computed, ref } from 'vue'

import { useAuth } from '@/business/auth/app/useAuth'
import { useAuthStore } from '@/business/auth/store'
import { useI18n } from '@/shared/i18n'
import { useNotifications } from '@/shared/composables/useNotifications'

export const useProfile = () => {
	const authStore = useAuthStore()
	const { sendVerificationEmail, reloadUser } = useAuth()
	const notifications = useNotifications()
	const { t } = useI18n()

	const loading = ref(false)
	const reloading = ref(false)

	const user = computed(() => authStore.user)
	const isEmailVerified = computed(() => user.value?.emailVerified ?? false)

	const handleResendVerification = async () => {
		if (!user.value) {
			return
		}

		loading.value = true

		try {
			const result = await sendVerificationEmail(user.value)

			if (result.success) {
				notifications.success(t('auth.verification.resendSuccess'))
			} else {
				notifications.error(result.error.message)
			}
		} catch (error) {
			notifications.error(t('auth.verification.resendError'))
		} finally {
			loading.value = false
		}
	}

	const handleReloadUser = async () => {
		reloading.value = true

		try {
			const result = await reloadUser()
			if (result.success) {
				notifications.info(t('profile.reloadSuccess'))
			} else {
				notifications.error(result.error.message)
			}
		} catch (error) {
			notifications.error(t('profile.reloadError'))
		} finally {
			reloading.value = false
		}
	}

	return {
		user,
		isEmailVerified,
		loading,
		reloading,
		handleResendVerification,
		handleReloadUser,
	}
}
