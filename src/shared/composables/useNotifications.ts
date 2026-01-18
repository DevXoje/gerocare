import { ref } from 'vue'

import type { AppError } from '@/shared/domain/AppError'
import { getUserFriendlyMessage } from '@/shared/error/errorMessages'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export const recordIcon: Record<NotificationType, string> = {
	success: '✓',
	error: '✕',
	warning: '⚠',
	info: 'ℹ',
}

export interface Notification {
	id: string
	type: NotificationType
	message: string
	duration?: number
}

const notifications = ref<Notification[]>([])

export const useNotifications = () => {
	const addNotification = (type: NotificationType, message: string, duration: number = 5000) => {
		const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
		const notification: Notification = {
			id,
			type,
			message,
			duration,
		}

		notifications.value.push(notification)

		if (duration > 0) {
			setTimeout(() => {
				removeNotification(id)
			}, duration)
		}
	}

	const removeNotification = (id: string) => {
		notifications.value = notifications.value.filter(n => n.id !== id)
	}

	const success = (message: string, duration?: number) => {
		addNotification('success', message, duration)
	}

	const error = (message: string | AppError, duration?: number) => {
		const errorMessage = typeof message === 'string' ? message : getUserFriendlyMessage(message)
		addNotification('error', errorMessage, duration)
	}

	const warning = (message: string, duration?: number) => {
		addNotification('warning', message, duration)
	}

	const info = (message: string, duration?: number) => {
		addNotification('info', message, duration)
	}

	return {
		notifications,
		addNotification,
		removeNotification,
		success,
		error,
		warning,
		info,
	}
}
