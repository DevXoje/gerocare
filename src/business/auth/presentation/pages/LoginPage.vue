<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useLoginForm } from '@/business/auth/app/useLoginForm'

const { email, password, loading, handleSubmit, handleGoogleSignIn } = useLoginForm()
</script>

<template>
	<div class="login">
		<div class="login__card">
			<h1 class="login__title">{{ $t('auth.login.title') }}</h1>

			<form class="form login__form" @submit.prevent="handleSubmit">
				<div class="form__group">
					<label for="email" class="form__label">{{ $t('auth.login.email') }}</label>
					<input
						id="email"
						v-model="email"
						type="email"
						:placeholder="$t('auth.login.emailPlaceholder')"
						class="input"
						:class="{ 'input--disabled': loading }"
						:required="true"
						:disabled="loading"
						autocomplete="email"
					/>
				</div>

				<div class="form__group">
					<label for="password" class="form__label">{{ $t('auth.login.password') }}</label>
					<input
						id="password"
						v-model="password"
						type="password"
						:placeholder="$t('auth.login.passwordPlaceholder')"
						class="input"
						:class="{ 'input--disabled': loading }"
						:required="true"
						:disabled="loading"
						autocomplete="current-password"
					/>
				</div>

				<button
					type="submit"
					class="button button--primary"
					:class="{ 'button--disabled': loading, 'button--loading': loading }"
					:disabled="loading"
				>
					<span v-if="loading">{{ $t('auth.login.loading') }}</span>
					<span v-else>{{ $t('auth.login.submit') }}</span>
				</button>
			</form>

			<div data-testid="login-separator" class="login__separator">
				<span class="login__separator-text">{{ $t('auth.login.separator') }}</span>
			</div>

			<button
				type="button"
				data-testid="google-sign-in-button"
				class="button button--google"
				:class="{ 'button--disabled': loading, 'button--loading': loading }"
				:disabled="loading"
				@click="handleGoogleSignIn"
			>
				<span v-if="loading">{{ $t('auth.login.loading') }}</span>
				<span v-else class="button--google__content">
					<svg
						class="button--google__icon"
						width="18"
						height="18"
						viewBox="0 0 18 18"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
							fill="#4285F4"
						/>
						<path
							d="M9 18c2.43 0 4.467-.806 5.96-2.184l-2.908-2.258c-.806.54-1.837.86-3.052.86-2.347 0-4.337-1.584-5.047-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
							fill="#34A853"
						/>
						<path
							d="M3.953 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l2.996-2.332z"
							fill="#FBBC05"
						/>
						<path
							d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.953 7.293C4.663 5.163 6.653 3.58 9 3.58z"
							fill="#EA4335"
						/>
					</svg>
					{{ $t('auth.login.googleSignIn') }}
				</span>
			</button>

			<div class="login__footer">
				<p class="login__footer-text">
					{{ $t('auth.login.noAccount') }}
					<RouterLink to="/signup" class="login__link">{{ $t('auth.login.signUp') }}</RouterLink>
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.login {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	padding: var(--spacing-lg);
	background: var(--color-button-primary-bg);
}

.login__card {
	background: var(--color-bg-primary);
	border-radius: var(--radius-lg);
	padding: var(--spacing-2xl);
	width: 100%;
	max-width: 400px;
	box-shadow: var(--shadow-xl);
}

.login__title {
	margin: 0 0 var(--spacing-2xl) 0;
	text-align: center;
	color: var(--color-text-primary);
}

.login__separator {
	display: flex;
	align-items: center;
	margin: var(--spacing-xl) 0;
	position: relative;
}

.login__separator::before,
.login__separator::after {
	content: '';
	flex: 1;
	height: 1px;
	background: var(--color-border-default);
}

.login__separator-text {
	padding: 0 var(--spacing-lg);
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}

.button--google {
	width: 100%;
	background: var(--color-button-google-bg);
	color: var(--color-text-primary);
	border: 1px solid var(--color-button-google-border);
}

.button--google:hover:not(:disabled) {
	background: var(--color-button-google-hover-bg);
	border-color: var(--color-border-hover);
}

.button--google__content {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-sm);
}

.button--google__icon {
	flex-shrink: 0;
}

.login__footer {
	margin-top: var(--spacing-xl);
	text-align: center;
}

.login__footer-text {
	margin: 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
}

.login__link {
	color: var(--color-text-link);
	text-decoration: none;
	font-weight: var(--font-weight-medium);
}

.login__link:hover {
	text-decoration: underline;
}
</style>
