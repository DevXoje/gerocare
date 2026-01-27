<script setup lang="ts">
import { useProfile } from '@/business/profile/app/useProfile'
import { Badge, Button, Card } from '@design-system/atoms'
import { useI18n } from '@/shared/i18n'

defineOptions({
	name: 'ProfilePage',
})

const { user, isEmailVerified, loading, reloading, handleResendVerification, handleReloadUser } =
	useProfile()
const { t } = useI18n()
</script>

<template>
	<div class="profile-page">
		<div class="profile-page__container">
			<h1 class="profile-page__title">{{ t('profile.title') }}</h1>

			<Card variant="elevated" padding="lg" class="profile-page__card">
				<div class="profile-page__header">
					<div class="profile-page__avatar">
						<img
							v-if="user?.photoURL"
							:src="user.photoURL"
							:alt="user.displayName || user.email || 'Usuario'"
						/>
						<span v-else class="profile-page__avatar-placeholder">
							{{ user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U' }}
						</span>
					</div>
					<div class="profile-page__user-info">
						<h2 class="profile-page__name">
							{{ user?.displayName || t('profile.noDisplayName') }}
						</h2>
						<p v-if="user?.email" class="profile-page__email">{{ user.email }}</p>
					</div>
				</div>

				<div class="profile-page__section">
					<h3 class="profile-page__section-title">{{ t('profile.emailVerification') }}</h3>
					<div class="profile-page__verification-status">
						<Badge v-if="isEmailVerified" variant="success">
							✓ {{ t('profile.emailVerified') }}
						</Badge>
						<Badge v-else variant="warning">
							⚠ {{ t('profile.emailNotVerified') }}
						</Badge>
					</div>

					<div v-if="!isEmailVerified" class="profile-page__verification-actions">
						<p class="profile-page__verification-message">
							{{ t('profile.verificationMessage') }}
						</p>
						<Button variant="primary" :loading="loading" @click="handleResendVerification">
							{{ t('profile.resendVerification') }}
						</Button>
					</div>
				</div>

				<div class="profile-page__section">
					<h3 class="profile-page__section-title">{{ t('profile.accountInfo') }}</h3>
					<div class="profile-page__info-grid">
						<div class="profile-page__info-item">
							<span class="profile-page__info-label">{{ t('profile.userId') }}</span>
							<span class="profile-page__info-value">{{ user?.uid }}</span>
						</div>
						<div class="profile-page__info-item">
							<span class="profile-page__info-label">{{ t('profile.email') }}</span>
							<span class="profile-page__info-value">{{ user?.email || t('profile.noEmail') }}</span>
						</div>
						<div class="profile-page__info-item">
							<span class="profile-page__info-label">{{ t('profile.displayName') }}</span>
							<span class="profile-page__info-value">
								{{ user?.displayName || t('profile.noDisplayName') }}
							</span>
						</div>
					</div>
				</div>

				<div class="profile-page__actions">
					<Button variant="outline" :loading="reloading" @click="handleReloadUser">
						{{ t('profile.refreshStatus') }}
					</Button>
				</div>
			</Card>
		</div>
	</div>
</template>

<style scoped>
.profile-page {
	padding: var(--spacing-xl);
	max-width: 800px;
	margin: 0 auto;
}

.profile-page__container {
	width: 100%;
}

.profile-page__title {
	margin: 0 0 var(--spacing-2xl) 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.profile-page__card {
	width: 100%;
}

.profile-page__header {
	display: flex;
	align-items: center;
	gap: var(--spacing-xl);
	margin-bottom: var(--spacing-2xl);
	padding-bottom: var(--spacing-2xl);
	border-bottom: 1px solid var(--color-border-default);
}

.profile-page__avatar {
	width: 80px;
	height: 80px;
	border-radius: var(--radius-full);
	overflow: hidden;
	flex-shrink: 0;
	background: var(--color-bg-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid var(--color-border-default);
}

.profile-page__avatar img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.profile-page__avatar-placeholder {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-secondary);
}

.profile-page__user-info {
	flex: 1;
	min-width: 0;
}

.profile-page__name {
	margin: 0 0 var(--spacing-xs) 0;
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.profile-page__email {
	margin: 0;
	font-size: var(--font-size-base);
	color: var(--color-text-secondary);
}

.profile-page__section {
	margin-bottom: var(--spacing-2xl);
}

.profile-page__section:last-of-type {
	margin-bottom: 0;
}

.profile-page__section-title {
	margin: 0 0 var(--spacing-md) 0;
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
}

.profile-page__verification-status {
	margin-bottom: var(--spacing-md);
}

.profile-page__verification-actions {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.profile-page__verification-message {
	margin: 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
	line-height: 1.6;
}

.profile-page__info-grid {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.profile-page__info-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.profile-page__info-label {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.profile-page__info-value {
	font-size: var(--font-size-base);
	color: var(--color-text-primary);
	word-break: break-all;
}

.profile-page__actions {
	margin-top: var(--spacing-2xl);
	padding-top: var(--spacing-2xl);
	border-top: 1px solid var(--color-border-default);
	display: flex;
	gap: var(--spacing-md);
}

@media (max-width: 768px) {
	.profile-page {
		padding: var(--spacing-lg);
	}

	.profile-page__header {
		flex-direction: column;
		text-align: center;
	}

	.profile-page__actions {
		flex-direction: column;
	}

	.profile-page__actions :deep(.button) {
		width: 100%;
	}
}
</style>
