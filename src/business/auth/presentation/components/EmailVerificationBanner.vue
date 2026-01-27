<script setup lang="ts">
import { computed, ref } from 'vue'

import { useAuth } from '@/business/auth/app/useAuth'
import { useAuthStore } from '@/business/auth/store'
import { Button } from '@design-system/atoms'
import { useI18n } from '@/shared/i18n'
import { useNotifications } from '@/shared/composables/useNotifications'

defineOptions({
	name: 'EmailVerificationBanner',
})

const authStore = useAuthStore()
const { sendVerificationEmail } = useAuth()
const notifications = useNotifications()
const { t } = useI18n()

const loading = ref(false)

const isVisible = computed(() => {
	return authStore.isAuthenticated && !authStore.user?.emailVerified
})

const handleResend = async () => {
	if (!authStore.user) {
		return
	}

	loading.value = true

	try {
		const result = await sendVerificationEmail(authStore.user)

		if (result.success) {
			notifications.success(t('auth.verification.resendSuccess'))
		} else {
			notifications.error(result.error.message)
		}
	} catch (error) {
		console.error('Error sending verification email:', error)
		notifications.error(t('auth.verification.resendError'))
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div v-if="isVisible" class="verification-banner">
		<div class="verification-banner__content">
			<div class="verification-banner__icon">📧</div>
			<div class="verification-banner__text">
				<p class="verification-banner__title">{{ t('auth.verification.banner.title') }}</p>
				<p class="verification-banner__message">{{ t('auth.verification.banner.message') }}</p>
			</div>
			<Button variant="outline" size="sm" :loading="loading" @click="handleResend">
				{{ t('auth.verification.banner.resendButton') }}
			</Button>
		</div>
	</div>
</template>

<style scoped>
.verification-banner {
	background: var(--token-color-warning-50);
	border-bottom: 1px solid var(--token-color-warning-200);
	padding: var(--spacing-md) var(--spacing-xl);
	width: 100%;
}

.verification-banner__content {
	display: flex;
	align-items: center;
	gap: var(--spacing-lg);
	max-width: 1200px;
	margin: 0 auto;
}

.verification-banner__icon {
	font-size: var(--font-size-xl);
	flex-shrink: 0;
}

.verification-banner__text {
	flex: 1;
	min-width: 0;
}

.verification-banner__title {
	margin: 0 0 var(--spacing-xs) 0;
	font-weight: var(--font-weight-semibold);
	color: var(--token-color-warning-900);
	font-size: var(--font-size-sm);
}

.verification-banner__message {
	margin: 0;
	color: var(--token-color-warning-800);
	font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
	.verification-banner__content {
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-md);
	}

	.verification-banner__text {
		width: 100%;
	}

	.verification-banner__content :deep(.button) {
		width: 100%;
	}
}
</style>
