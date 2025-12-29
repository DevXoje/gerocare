<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/business/auth/app/useAuth'
import { useAuthStore } from '@/business/auth/store'
import { useSidebar } from '@/shared/composables/useSidebar'

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
        <router-link
          to="/dashboard"
          class="nav-item"
          active-class="nav-item-active"
          @click="handleNavigation('/dashboard')"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div v-if="user" class="user-profile">
          <div class="user-avatar">
            <img
              v-if="user.photoURL"
              :src="user.photoURL"
              :alt="user.displayName || 'Usuario'"
            />
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

  <div
    v-if="isMobile && isOpen"
    class="sidebar-overlay"
    @click="close"
  ></div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
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
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.logo h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  gap: 0.75rem;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-item-active {
  background-color: #eff6ff;
  color: #2563eb;
  border-right: 3px solid #2563eb;
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
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #e5e7eb;
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
  font-weight: 600;
  color: #6b7280;
  font-size: 1rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #c82333;
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
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
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

