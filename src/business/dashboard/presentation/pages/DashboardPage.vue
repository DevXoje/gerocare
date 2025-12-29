<script setup lang="ts">
import { useAuthStore } from '@/business/auth/store'

const authStore = useAuthStore()
const user = authStore.user
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <h1 class="dashboard-title">Dashboard</h1>

      <div class="user-info-card">
        <h2>Información del Usuario</h2>
        <div v-if="user" class="user-details">
          <p><strong>UID:</strong> {{ user.uid }}</p>
          <p v-if="user.email"><strong>Email:</strong> {{ user.email }}</p>
          <p v-if="user.displayName"><strong>Nombre:</strong> {{ user.displayName }}</p>
          <p><strong>Email Verificado:</strong> {{ user.emailVerified ? 'Sí' : 'No' }}</p>
        </div>
        <div v-else>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
}

.dashboard-content {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .dashboard-content {
    padding: 2rem;
  }
}

.dashboard-title {
  margin: 0 0 2rem 0;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
}

@media (max-width: 767px) {
  .dashboard-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.user-info-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .user-info-card {
    padding: 2rem;
  }
}

.user-info-card h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.user-details p {
  margin: 0.75rem 0;
  color: #555;
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .user-details p {
    font-size: 1rem;
  }
}

.user-details strong {
  color: #333;
  margin-right: 0.5rem;
}
</style>
