import type { App } from 'vue'

import { createAppError, toAppError } from '@/shared/domain/AppError'
import { logError } from '@/shared/error/errorLogger'

/**
 * Setup global error handling for the Vue application
 * Captures:
 * - Vue component errors
 * - Unhandled JavaScript errors
 * - Unhandled promise rejections
 */
export function setupGlobalErrorHandling(app: App): void {
	// Handle Vue component errors
	app.config.errorHandler = (err, instance, info) => {
		const error = toAppError(err, 'Error en componente Vue')
		logError(error, {
			componentInfo: info,
			instance: instance?.$?.type?.name || 'Unknown component',
		})

		// Note: User notifications should be handled at the component level
		// Global error handler only logs errors
	}

	// Handle unhandled JavaScript errors
	window.addEventListener('error', event => {
		const error = createAppError(
			'UNKNOWN_ERROR',
			event.message || 'Error de JavaScript no manejado',
			{
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error,
				stack: event.error?.stack,
			}
		)
		logError(error, {
			type: 'unhandled_error',
			url: event.filename,
			line: event.lineno,
			column: event.colno,
		})
	})

	// Handle unhandled promise rejections
	window.addEventListener('unhandledrejection', event => {
		const error = toAppError(event.reason, 'Error en promesa no manejada')
		logError(error, {
			type: 'unhandled_rejection',
			reason: event.reason,
		})

		// Prevent default browser behavior (logging to console)
		// We've already logged it ourselves
		event.preventDefault()
	})
}
