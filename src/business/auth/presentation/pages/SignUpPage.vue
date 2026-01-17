<script setup lang="ts">
import { useSignUpForm } from '@/business/auth/app/useSignUpForm'
import { RouterLink } from 'vue-router'

const { email, password, passwordConfirmation, loading, handleSubmit, handleGoogleSignIn } = useSignUpForm()
</script>

<template>
  <div class="signup">
    <div class="signup__card">
      <h1 class="signup__title">Crear Cuenta</h1>

      <form class="form signup__form" @submit.prevent="handleSubmit">
        <div class="form__group">
          <label for="email" class="form__label">Email</label>
          <input id="email" v-model="email" type="email" placeholder="tu@email.com" class="input"
            :class="{ 'input--disabled': loading }" :required="true" :disabled="loading" autocomplete="email" />
        </div>

        <div class="form__group">
          <label for="password" class="form__label">Contraseña</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" class="input"
            :class="{ 'input--disabled': loading }" :required="true" :disabled="loading"
            autocomplete="new-password" />
        </div>

        <div class="form__group">
          <label for="password-confirmation" class="form__label">Confirmar Contraseña</label>
          <input id="password-confirmation" v-model="passwordConfirmation" type="password" placeholder="••••••••" class="input"
            :class="{ 'input--disabled': loading }" :required="true" :disabled="loading"
            autocomplete="new-password" />
        </div>

        <button type="submit" data-testid="sign-up-submit-button" class="button button--primary"
          :class="{ 'button--disabled': loading, 'button--loading': loading }" :disabled="loading">
          <span v-if="loading">Creando cuenta...</span>
          <span v-else>Registrarse</span>
        </button>
      </form>

      <div data-testid="signup-separator" class="signup__separator">
        <span class="signup__separator-text">o</span>
      </div>

      <button type="button" data-testid="google-sign-up-button" class="button button--google"
        :class="{ 'button--disabled': loading, 'button--loading': loading }" :disabled="loading"
        @click="handleGoogleSignIn">
        <span v-if="loading">Creando cuenta...</span>
        <span v-else>Continuar con Google</span>
      </button>

      <div class="signup__footer">
        <p class="signup__footer-text">
          ¿Ya tienes cuenta?
          <RouterLink data-testid="login-link" to="/login" class="signup__link">Inicia sesión</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background: var(--color-button-primary-bg);
}

.signup__card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
}

.signup__title {
  margin: 0 0 var(--spacing-2xl) 0;
  text-align: center;
  color: var(--color-text-primary);
}

.signup__separator {
  display: flex;
  align-items: center;
  margin: var(--spacing-xl) 0;
  position: relative;
}

.signup__separator::before,
.signup__separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-default);
}

.signup__separator-text {
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

.signup__footer {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.signup__footer-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.signup__link {
  color: var(--color-text-link);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.signup__link:hover {
  text-decoration: underline;
}
</style>
