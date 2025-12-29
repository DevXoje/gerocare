<script setup lang="ts">
import Sidebar from '@/presentation/components/organisms/Sidebar.vue'
import { useSidebar } from '@/shared/composables/useSidebar'

const { isOpen, isMobile, toggle } = useSidebar()
</script>

<template>
  <div class="private-layout">
    <Sidebar />
    
    <div class="layout-main">
      <header class="layout-header" v-if="isMobile">
        <button class="menu-toggle" @click="toggle" aria-label="Toggle menu">
          <span class="hamburger-icon">☰</span>
        </button>
        <h1 class="layout-title">GeroCare</h1>
      </header>

      <main class="layout-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.private-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  transition: margin-left 0.3s ease-in-out;
}

@media (min-width: 768px) {
  .layout-main {
    margin-left: 280px;
  }
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .layout-header {
    display: none;
  }
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-toggle:hover {
  background-color: #f3f4f6;
}

.hamburger-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.layout-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.layout-content {
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}
</style>

