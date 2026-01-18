import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createAppError } from '@/shared/domain/AppError'
import { Err, Ok, type Result } from '@/shared/domain/Result'
import { logError } from '@/shared/error/errorLogger'

import { chainResults, handleResult, mapError, unwrapOr, unwrapOrThrow } from '../ResultHelpers'

// Mock errorLogger
vi.mock('@/shared/error/errorLogger', () => ({
	logError: vi.fn(),
}))

describe('ResultHelpers', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('handleResult', () => {
		it('should call onSuccess when result is Ok', () => {
			const result: Result<string, never> = Ok('success')
			const onSuccess = vi.fn()
			const onError = vi.fn()

			handleResult(result, onSuccess, onError)

			expect(onSuccess).toHaveBeenCalledWith('success')
			expect(onError).not.toHaveBeenCalled()
			expect(logError).not.toHaveBeenCalled()
		})

		it('should call onError and log error when result is Err', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error')
			const result: Result<never, typeof error> = Err(error)
			const onSuccess = vi.fn()
			const onError = vi.fn()

			handleResult(result, onSuccess, onError)

			expect(onSuccess).not.toHaveBeenCalled()
			expect(onError).toHaveBeenCalledWith(error)
			expect(logError).toHaveBeenCalledWith(error)
		})
	})

	describe('unwrapOrThrow', () => {
		it('should return value when result is Ok', () => {
			const result: Result<string, never> = Ok('success')

			const value = unwrapOrThrow(result)

			expect(value).toBe('success')
			expect(logError).not.toHaveBeenCalled()
		})

		it('should throw error and log it when result is Err', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error')
			const result: Result<never, typeof error> = Err(error)

			expect(() => unwrapOrThrow(result)).toThrow()
			expect(logError).toHaveBeenCalledWith(error)
		})
	})

	describe('mapError', () => {
		it('should return original result when result is Ok', () => {
			const result: Result<string, never> = Ok('success')
			const mapper = vi.fn()

			const mapped = mapError(result, mapper)

			expect(mapped).toBe(result)
			expect(mapper).not.toHaveBeenCalled()
		})

		it('should map error when result is Err', () => {
			const originalError = createAppError('VALIDATION_ERROR', 'Original error')
			const result: Result<never, typeof originalError> = Err(originalError)
			const newError = createAppError('NETWORK_ERROR', 'Mapped error')
			const mapper = vi.fn(() => newError)

			const mapped = mapError(result, mapper)

			expect(mapped.success).toBe(false)
			expect(mapped).toHaveProperty('error')
			expect((mapped as { error: typeof newError }).error).toBe(newError)
			expect(mapper).toHaveBeenCalledWith(originalError)
		})
	})

	describe('unwrapOr', () => {
		it('should return value when result is Ok', () => {
			const result: Result<string, never> = Ok('success')
			const defaultValue = 'default'

			const value = unwrapOr(result, defaultValue)

			expect(value).toBe('success')
			expect(logError).not.toHaveBeenCalled()
		})

		it('should return default value and log error when result is Err', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error')
			const result: Result<never, typeof error> = Err(error)
			const defaultValue = 'default'

			const value = unwrapOr(result, defaultValue)

			expect(value).toBe(defaultValue)
			expect(logError).toHaveBeenCalledWith(error)
		})
	})

	describe('chainResults', () => {
		it('should return first error encountered', () => {
			const error1 = createAppError('VALIDATION_ERROR', 'First error')
			const error2 = createAppError('NETWORK_ERROR', 'Second error')
			const results: Result<unknown, typeof error1>[] = [
				Ok('success1'),
				Err(error1),
				Err(error2),
				Ok('success2'),
			]

			const chained = chainResults<string, typeof error1>(...results)

			expect(chained.success).toBe(false)
			expect(chained).toHaveProperty('error')
			expect((chained as { error: typeof error1 }).error).toBe(error1)
		})

		it('should return last result value when all are Ok', () => {
			const results: Result<string, never>[] = [Ok('first'), Ok('second'), Ok('third')]

			const chained = chainResults<string, never>(...results)

			expect(chained.success).toBe(true)
			expect(chained).toHaveProperty('value')
			expect((chained as { value: string }).value).toBe('third')
		})

		it('should return first result when only one result provided', () => {
			const result: Result<string, never> = Ok('single')

			const chained = chainResults<string, never>(result)

			expect(chained.success).toBe(true)
			expect(chained).toHaveProperty('value')
			expect((chained as { value: string }).value).toBe('single')
		})
	})
})
