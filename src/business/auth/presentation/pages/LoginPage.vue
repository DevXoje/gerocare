<script setup lang="ts">
import { useLoginForm } from '@/business/auth/app/useLoginForm'

const { email, password, loading, handleSubmit } = useLoginForm()
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
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login__card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login__title {
  margin: 0 0 2rem 0;
  text-align: center;
  color: #333;
}
</style>
