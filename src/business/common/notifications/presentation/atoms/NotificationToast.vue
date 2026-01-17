<script setup lang="ts">
import { useNotifications } from '@/shared/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
    default:
      return ''
  }
}
</script>

<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification--${notification.type}`]"
      >
        <div class="notification__icon">{{ getIcon(notification.type) }}</div>
        <div class="notification__message">{{ notification.message }}</div>
        <button
          class="notification__close"
          @click="removeNotification(notification.id)"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  pointer-events: auto;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.notification__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

.notification__message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.notification__close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.notification__close:hover {
  color: #333;
}

.notification--success {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.notification--success .notification__icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.notification--success .notification__message {
  color: white;
}

.notification--success .notification__close {
  color: rgba(255, 255, 255, 0.8);
}

.notification--success .notification__close:hover {
  color: white;
}

.notification--error {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.notification--error .notification__icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.notification--error .notification__message {
  color: white;
}

.notification--error .notification__close {
  color: rgba(255, 255, 255, 0.8);
}

.notification--error .notification__close:hover {
  color: white;
}

.notification--warning {
  background: linear-gradient(135deg, #fad961 0%, #f76b1c 100%);
  color: white;
}

.notification--warning .notification__icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.notification--warning .notification__message {
  color: white;
}

.notification--warning .notification__close {
  color: rgba(255, 255, 255, 0.8);
}

.notification--warning .notification__close:hover {
  color: white;
}

.notification--info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.notification--info .notification__icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.notification--info .notification__message {
  color: white;
}

.notification--info .notification__close {
  color: rgba(255, 255, 255, 0.8);
}

.notification--info .notification__close:hover {
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>

