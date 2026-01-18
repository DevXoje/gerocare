import type { AppError } from '@/shared/domain/AppError'

/**
 * Log levels for error logging
 */
export type LogLevel = 'error' | 'warning' | 'info' | 'debug'

/**
 * Context information to include with logs
 */
export interface LogContext {
	[key: string]: unknown
}

/**
 * Check if we're in development mode
 */
const isDevelopment = import.meta.env.DEV

/**
 * Format error for logging
 */
function formatError(error: AppError, context?: LogContext): string {
	const parts = [`[${error.code}]`, error.message]

	if (error.details) {
		parts.push(`Details: ${JSON.stringify(error.details, null, 2)}`)
	}

	if (context && Object.keys(context).length > 0) {
		parts.push(`Context: ${JSON.stringify(context, null, 2)}`)
	}

	if (error.timestamp) {
		parts.push(`Timestamp: ${error.timestamp.toISOString()}`)
	}

	return parts.join(' | ')
}

/**
 * Log an error
 * In development: logs to console with full details
 * In production: can be extended to send to external service (Sentry, LogRocket, etc.)
 */
export function logError(error: AppError, context?: LogContext): void {
	const formattedMessage = formatError(error, context)

	if (isDevelopment) {
		console.error('[ERROR]', formattedMessage)
		if (error.details) {
			console.error('Error details:', error.details)
		}
		if (context) {
			console.error('Context:', context)
		}
	} else {
		// In production, you can integrate with external services here
		// Example: Sentry.captureException(error)
		console.error('[ERROR]', formattedMessage)
	}
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: LogContext): void {
	const formattedMessage = context
		? `${message} | Context: ${JSON.stringify(context, null, 2)}`
		: message

	if (isDevelopment) {
		console.warn('[WARNING]', formattedMessage)
		if (context) {
			console.warn('Context:', context)
		}
	} else {
		console.warn('[WARNING]', formattedMessage)
	}
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
	const formattedMessage = context
		? `${message} | Context: ${JSON.stringify(context, null, 2)}`
		: message

	if (isDevelopment) {
		console.info('[INFO]', formattedMessage)
		if (context) {
			console.info('Context:', context)
		}
	} else {
		console.info('[INFO]', formattedMessage)
	}
}

/**
 * Log a debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
	if (isDevelopment) {
		const formattedMessage = context
			? `${message} | Context: ${JSON.stringify(context, null, 2)}`
			: message
		console.debug('[DEBUG]', formattedMessage)
		if (context) {
			console.debug('Context:', context)
		}
	}
}
