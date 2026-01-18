import type { AppError } from '@/shared/domain/AppError'
import { Err, Ok, type Result } from '@/shared/domain/Result'
import { logError } from '@/shared/error/errorLogger'

/**
 * Handle a Result type with success and error callbacks
 */
export function handleResult<T, E extends AppError>(
	result: Result<T, E>,
	onSuccess: (value: T) => void,
	onError: (error: E) => void
): void {
	if (result.success) {
		onSuccess(result.value)
	} else {
		logError(result.error)
		onError(result.error)
	}
}

/**
 * Unwrap a Result, throwing the error if it's an error
 * Automatically logs the error before throwing
 */
export function unwrapOrThrow<T, E extends AppError>(result: Result<T, E>): T {
	if (result.success) {
		return result.value
	}
	logError(result.error)
	throw result.error
}

/**
 * Map an error in a Result to a different error type
 */
export function mapError<T, E extends AppError, F extends AppError>(
	result: Result<T, E>,
	mapper: (error: E) => F
): Result<T, F> {
	if (result.success) {
		return result
	}
	return Err(mapper(result.error))
}

/**
 * Unwrap a Result or return a default value
 * Logs the error if it's an error
 */
export function unwrapOr<T, E extends AppError>(result: Result<T, E>, defaultValue: T): T {
	if (result.success) {
		return result.value
	}
	logError(result.error)
	return defaultValue
}

/**
 * Chain multiple Results together
 * Returns the first error encountered, or the final success value
 */
export function chainResults<T, E extends AppError>(
	...results: Result<unknown, E>[]
): Result<T, E> {
	for (const result of results) {
		if (!result.success) {
			return result as Result<T, E>
		}
	}
	// If we get here, all results were successful
	// Return the last result's value
	const lastResult = results[results.length - 1]
	return lastResult.success ? Ok(lastResult.value as T) : (lastResult as Result<T, E>)
}
