<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useLoginForm } from '@/business/auth/app/useLoginForm'

const { email, password, loading, handleSubmit, handleGoogleSignIn } = useLoginForm()
</script>

<template>
  <div class="login">
    <div class="login__card">
      <h1 class="login__title">Iniciar Sesión</h1>

      <form class="form login__form" @submit.prevent="handleSubmit">
        <div class="form__group">
          <label for="email" class="form__label">Email</label>
          <input id="email" v-model="email" type="email" placeholder="tu@email.com" class="input"
            :class="{ 'input--disabled': loading }" :required="true" :disabled="loading" autocomplete="email" />
        </div>

        <div class="form__group">
          <label for="password" class="form__label">Contraseña</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" class="input"
            :class="{ 'input--disabled': loading }" :required="true" :disabled="loading"
            autocomplete="current-password" />
        </div>

        <button type="submit" class="button button--primary"
          :class="{ 'button--disabled': loading, 'button--loading': loading }" :disabled="loading">
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <div data-testid="login-separator" class="login__separator">
        <span class="login__separator-text">o</span>
      </div>

      <button type="button" data-testid="google-sign-in-button" class="button button--google"
        :class="{ 'button--disabled': loading, 'button--loading': loading }" :disabled="loading"
        @click="handleGoogleSignIn">
        <span v-if="loading">Iniciando sesión...</span>
        <span v-else>Continuar con Google</span>
      </button>

      <div class="login__footer">
        <p class="login__footer-text">
          ¿No tienes cuenta?
          <RouterLink to="/signup" class="login__link">Regístrate</RouterLink>
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
