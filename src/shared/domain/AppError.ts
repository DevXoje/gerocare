/**
 * Base error type for the application
 * All domain-specific errors should extend this interface
 */
export interface AppError {
	code: string
	message: string
	details?: unknown
	timestamp: Date
}

/**
 * Standard error codes used across the application
 */
export type ErrorCode =
	| 'VALIDATION_ERROR'
	| 'NOT_FOUND'
	| 'PERMISSION_ERROR'
	| 'REPOSITORY_ERROR'
	| 'NETWORK_ERROR'
	| 'AUTH_ERROR'
	| 'UNKNOWN_ERROR'
	| 'CREATE_FAILED'
	| 'UPDATE_FAILED'
	| 'DELETE_FAILED'

/**
 * Factory function to create an AppError
 */
export function createAppError(
	code: ErrorCode | string,
	message: string,
	details?: unknown
): AppError {
	return {
		code,
		message,
		details,
		timestamp: new Date(),
	}
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		'message' in error &&
		'timestamp' in error &&
		typeof (error as AppError).code === 'string' &&
		typeof (error as AppError).message === 'string' &&
		(error as AppError).timestamp instanceof Date
	)
}

/**
 * Convert an unknown error to AppError
 * Useful for catching and converting unexpected errors
 */
export function toAppError(
	error: unknown,
	defaultMessage: string = 'An unexpected error occurred'
): AppError {
	if (isAppError(error)) {
		return error
	}

	if (error instanceof Error) {
		return createAppError('UNKNOWN_ERROR', error.message || defaultMessage, {
			originalError: error.message,
			stack: error.stack,
			name: error.name,
		})
	}

	if (typeof error === 'string') {
		return createAppError('UNKNOWN_ERROR', error)
	}

	return createAppError('UNKNOWN_ERROR', defaultMessage, {
		originalError: error,
	})
}
