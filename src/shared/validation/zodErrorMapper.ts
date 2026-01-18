import { type ZodError } from 'zod'

import { type AppError, createAppError } from '@/shared/domain/AppError'

/**
 * Map a Zod validation error to an AppError
 * Extracts the first error message and includes all issues in details
 */
export function mapZodErrorToAppError(zodError: ZodError): AppError {
	const firstIssue = zodError.issues[0]
	const message = firstIssue?.message || 'Error de validación'

	// Format all issues for details
	const formattedIssues = zodError.issues.map(issue => ({
		path: issue.path.join('.'),
		message: issue.message,
		code: issue.code,
	}))

	return createAppError('VALIDATION_ERROR', message, {
		issues: formattedIssues,
		allIssues: zodError.issues,
		formatted: formattedIssues.map(i => `${i.path}: ${i.message}`).join(', '),
	})
}

/**
 * Get a user-friendly validation error message from Zod error
 * Returns a single message that can be shown to the user
 */
export function getZodErrorMessage(zodError: ZodError): string {
	if (zodError.issues.length === 0) {
		return 'Error de validación'
	}

	if (zodError.issues.length === 1) {
		const issue = zodError.issues[0]
		const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
		return `${path}${issue.message}`
	}

	// Multiple errors: return a summary
	const errorCount = zodError.issues.length
	const firstError = zodError.issues[0]
	return `${firstError.message} (y ${errorCount - 1} error${errorCount - 1 > 1 ? 'es' : ''} más)`
}
