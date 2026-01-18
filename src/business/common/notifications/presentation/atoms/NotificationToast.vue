<script setup lang="ts">
import { recordIcon, useNotifications } from '@/shared/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()
</script>

<template>
	<div class="notification-container">
		<TransitionGroup name="notification" tag="div">
			<div
				v-for="notification in notifications"
				:key="notification.id"
				:class="['notification', `notification--${notification.type}`]"
			>
				<div class="notification__icon">{{ recordIcon[notification.type] }}</div>
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
	top: var(--spacing-lg);
	right: var(--spacing-lg);
	z-index: 9999;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
	max-width: 400px;
	pointer-events: none;
}

.notification {
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
	padding: var(--spacing-lg) var(--spacing-xl);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-lg);
	background: var(--vt-c-white);
	pointer-events: auto;
	min-width: 300px;
	animation: slideIn var(--transition-slow) ease-out;
}

.notification__icon {
	flex-shrink: 0;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-full);
	font-weight: var(--font-weight-bold);
	font-size: var(--font-size-sm);
}

.notification__message {
	flex: 1;
	font-size: var(--font-size-sm);
	line-height: var(--line-height-normal);
	color: var(--color-text-primary);
}

.notification__close {
	flex-shrink: 0;
	background: none;
	border: none;
	cursor: pointer;
	color: var(--color-text-tertiary);
	font-size: var(--font-size-lg);
	line-height: var(--line-height-tight);
	padding: 0;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: color var(--transition-base);
}

.notification__close:hover {
	color: var(--color-text-primary);
}

.notification--success {
	background: linear-gradient(
		135deg,
		var(--token-color-primary-600) 0%,
		var(--token-color-primary-800) 100%
	);
	color: var(--vt-c-white);
}

.notification--success .notification__icon {
	background: rgba(255, 255, 255, 0.2);
	color: var(--vt-c-white);
}

.notification--success .notification__message {
	color: var(--vt-c-white);
}

.notification--success .notification__close {
	color: rgba(255, 255, 255, 0.8);
}

.notification--success .notification__close:hover {
	color: var(--vt-c-white);
}

.notification--error {
	background: linear-gradient(
		135deg,
		var(--token-color-error-500) 0%,
		var(--token-color-error-700) 100%
	);
	color: var(--vt-c-white);
}

.notification--error .notification__icon {
	background: rgba(255, 255, 255, 0.2);
	color: var(--vt-c-white);
}

.notification--error .notification__message {
	color: var(--vt-c-white);
}

.notification--error .notification__close {
	color: rgba(255, 255, 255, 0.8);
}

.notification--error .notification__close:hover {
	color: var(--vt-c-white);
}

.notification--warning {
	background: linear-gradient(
		135deg,
		var(--token-color-warning-500) 0%,
		var(--token-color-warning-700) 100%
	);
	color: var(--vt-c-white);
}

.notification--warning .notification__icon {
	background: rgba(255, 255, 255, 0.2);
	color: var(--vt-c-white);
}

.notification--warning .notification__message {
	color: var(--vt-c-white);
}

.notification--warning .notification__close {
	color: rgba(255, 255, 255, 0.8);
}

.notification--warning .notification__close:hover {
	color: var(--vt-c-white);
}

.notification--info {
	background: linear-gradient(
		135deg,
		var(--token-color-info-500) 0%,
		var(--token-color-info-700) 100%
	);
	color: var(--vt-c-white);
}

.notification--info .notification__icon {
	background: rgba(255, 255, 255, 0.2);
	color: var(--vt-c-white);
}

.notification--info .notification__message {
	color: var(--vt-c-white);
}

.notification--info .notification__close {
	color: rgba(255, 255, 255, 0.8);
}

.notification--info .notification__close:hover {
	color: var(--vt-c-white);
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
	transition: all var(--transition-slow) ease-out;
}

.notification-leave-active {
	transition: all var(--transition-slow) ease-in;
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
	transition: transform var(--transition-slow) ease;
}
</style>
