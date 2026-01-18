<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuth } from '@/business/auth/app/useAuth'
import { useAuthStore } from '@/business/auth/store'
import ThemeSelector from '@/business/common/theming/presentation/atoms/ThemeSelector.vue';
import { useSidebar } from '@/shared/composables/useSidebar'

defineOptions({
  name: 'AppSidebar',
})

const router = useRouter()
const { signOut } = useAuth()
const authStore = useAuthStore()
const { isOpen, isMobile, close } = useSidebar()

const user = authStore.user

const handleLogout = async () => {
  try {
    await signOut()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

const handleNavigation = (path: string) => {
  router.push(path)
  if (isMobile.value) {
    close()
  }
}
</script>

<template>
  <aside :class="['sidebar', { 'sidebar-open': isOpen, 'sidebar-mobile': isMobile }]">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <div class="logo">
          <h2>GeroCare</h2>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/dashboard')">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </router-link>
        <router-link to="/residents" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/residents')">
          <span class="nav-icon">👥</span>
          <span class="nav-label">Residentes</span>
        </router-link>
        <router-link to="/medications" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/medications')">
          <span class="nav-icon">💊</span>
          <span class="nav-label">Medicación</span>
        </router-link>
        <router-link to="/care-plans" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/care-plans')">
          <span class="nav-icon">📋</span>
          <span class="nav-label">Planes de Atención (PAI)</span>
        </router-link>
        <router-link to="/incidents" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/incidents')">
          <span class="nav-icon">⚠️</span>
          <span class="nav-label">Incidencias</span>
        </router-link>
        <router-link to="/activity-logs" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/activity-logs')">
          <span class="nav-icon">📝</span>
          <span class="nav-label">Registro de Actividades</span>
        </router-link>
        <router-link to="/shifts" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/shifts')">
          <span class="nav-icon">📅</span>
          <span class="nav-label">Turnos</span>
        </router-link>
        <router-link to="/reports" class="nav-item" active-class="nav-item-active"
          @click="handleNavigation('/reports')">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Reportes</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <ThemeSelector />
        <div v-if="user" class="user-profile">
          <div class="user-avatar">
            <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName || 'Usuario'" />
            <span v-else class="avatar-placeholder">
              {{ user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U' }}
            </span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ user.displayName || 'Usuario' }}</p>
            <p v-if="user.email" class="user-email">{{ user.email }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="logout-button">
          <span class="logout-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </aside>

  <div v-if="isMobile && isOpen" class="sidebar-overlay" @click="close"></div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-md);
  transform: translateX(-100%);
  transition: transform var(--transition-slow);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-mobile {
  width: 280px;
}

@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
    position: fixed;
  }
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-default);
}

.logo h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-xl);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-base);
  gap: var(--spacing-md);
}

.nav-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.nav-item-active {
  background-color: var(--color-bg-active);
  color: var(--token-color-info-600);
  border-right: 3px solid var(--token-color-info-600);
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-weight: 500;
}

.sidebar-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border-default);
  background-color: var(--color-bg-secondary);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-default);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--color-border-default);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-button-danger-bg);
  color: var(--color-button-danger-text);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-base);
}

.logout-button:hover {
  background-color: var(--color-button-danger-hover);
}

.logout-icon {
  font-size: 1rem;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay-bg);
  z-index: 999;
  animation: fadeIn var(--transition-slow);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
