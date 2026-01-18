export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E }

export const Ok = <T>(value: T): Result<T, never> => ({
	success: true,
	value,
})

export const Err = <E>(error: E): Result<never, E> => ({
	success: false,
	error,
})

export function isOk<T, E>(result: Result<T, E>): result is { success: true; value: T } {
	return result.success === true
}

export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
	return result.success === false
}

export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
	if (isOk(result)) {
		return Ok(fn(result.value))
	}
	return result
}

export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
	if (isErr(result)) {
		return Err(fn(result.error))
	}
	return result
}

export function unwrap<T, E>(result: Result<T, E>): T {
	if (isOk(result)) {
		return result.value
	}
	throw result.error
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
	if (isOk(result)) {
		return result.value
	}
	return defaultValue
}
