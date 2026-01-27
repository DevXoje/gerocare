<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/business/auth/app/useAuth'
import { useAuthStore } from '@/business/auth/store'
import { Button, Card } from '@design-system/atoms'
import { useI18n } from '@/shared/i18n'
import { useNotifications } from '@/shared/composables/useNotifications'

defineOptions({
	name: 'EmailVerificationRequiredPage',
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { sendVerificationEmail, reloadUser } = useAuth()
const notifications = useNotifications()
const { t } = useI18n()

const loading = ref(false)
const checkingStatus = ref(false)

const redirectPath = computed(() => {
	return (route.query.redirect as string) || '/dashboard'
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
		notifications.error(t('auth.verification.resendError'))
	} finally {
		loading.value = false
	}
}

const handleGoToDashboard = () => {
	router.push('/dashboard')
}

const checkVerificationStatus = async () => {
	if (!authStore.user) {
		return
	}

	checkingStatus.value = true

	try {
		const result = await reloadUser()
		if (result.success && result.value.emailVerified) {
			// Email is now verified, redirect to the original destination
			router.push(redirectPath.value)
		}
	} catch (error) {
		// Silently fail - user can manually check
	} finally {
		checkingStatus.value = false
	}
}

onMounted(() => {
	// Check verification status periodically
	const interval = setInterval(() => {
		if (authStore.user && !authStore.user.emailVerified) {
			checkVerificationStatus()
		} else {
			clearInterval(interval)
		}
	}, 5000) // Check every 5 seconds

	// Cleanup on unmount
	return () => clearInterval(interval)
})
</script>

<template>
	<div class="verification-required-page">
		<div class="verification-required-page__container">
			<Card variant="elevated" padding="lg" class="verification-required-page__card">
				<div class="verification-required-page__icon">📧</div>
				<h1 class="verification-required-page__title">
					{{ t('auth.verification.required.title') }}
				</h1>
				<p class="verification-required-page__message">
					{{ t('auth.verification.required.message') }}
				</p>

				<div v-if="authStore.user?.email" class="verification-required-page__email">
					<strong>{{ authStore.user.email }}</strong>
				</div>

				<div class="verification-required-page__actions">
					<Button variant="primary" :loading="loading" @click="handleResend" block>
						{{ t('auth.verification.required.resendButton') }}
					</Button>
					<Button variant="outline" @click="handleGoToDashboard" block>
						{{ t('auth.verification.required.goToDashboard') }}
					</Button>
				</div>

				<div class="verification-required-page__instructions">
					<p class="verification-required-page__instruction-title">
						{{ t('auth.verification.required.receivedEmail') }}
					</p>
					<ol class="verification-required-page__steps">
						<li>{{ t('auth.verification.required.step1') }}</li>
						<li>{{ t('auth.verification.required.step2') }}</li>
						<li>{{ t('auth.verification.required.step3') }}</li>
					</ol>
					<p class="verification-required-page__instruction-note">
						{{ t('auth.verification.required.notReceivedEmail') }}
					</p>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.verification-required-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-xl);
	background: var(--color-bg-secondary);
}

.verification-required-page__container {
	width: 100%;
	max-width: 500px;
}

.verification-required-page__card {
	text-align: center;
}

.verification-required-page__icon {
	font-size: 4rem;
	margin-bottom: var(--spacing-lg);
}

.verification-required-page__title {
	margin: 0 0 var(--spacing-md) 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.verification-required-page__message {
	margin: 0 0 var(--spacing-xl) 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-base);
	line-height: 1.6;
}

.verification-required-page__email {
	margin-bottom: var(--spacing-xl);
	padding: var(--spacing-md);
	background: var(--color-bg-secondary);
	border-radius: var(--radius-md);
	border: 1px solid var(--color-border-default);
}

.verification-required-page__email strong {
	color: var(--color-text-primary);
	font-size: var(--font-size-base);
}

.verification-required-page__actions {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
	margin-bottom: var(--spacing-2xl);
}

.verification-required-page__instructions {
	text-align: left;
	padding-top: var(--spacing-xl);
	border-top: 1px solid var(--color-border-default);
}

.verification-required-page__instruction-title {
	margin: 0 0 var(--spacing-md) 0;
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	font-size: var(--font-size-base);
}

.verification-required-page__steps {
	margin: 0 0 var(--spacing-md) var(--spacing-lg);
	padding: 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
	line-height: 1.8;
}

.verification-required-page__steps li {
	margin-bottom: var(--spacing-xs);
}

.verification-required-page__instruction-note {
	margin: 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
	font-style: italic;
}
</style>
