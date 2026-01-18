import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createAppError } from '@/shared/domain/AppError'

import { logDebug, logError, logInfo, logWarning } from '../errorLogger'

describe('errorLogger', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'debug').mockImplementation(() => {})
	})

	describe('logError', () => {
		it('should log error to console.error', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error message')

			logError(error)

			expect(console.error).toHaveBeenCalledTimes(1)
			const calls = (console.error as ReturnType<typeof vi.fn>).mock.calls
			expect(calls.length).toBeGreaterThan(0)
			const callArgs = calls[0]!
			expect(callArgs[0]).toBe('[ERROR]')
			const logMessage = callArgs[1] as string
			expect(logMessage).toContain('[VALIDATION_ERROR]')
			expect(logMessage).toContain('Test error message')
		})

		it('should include error details in log', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error', { field: 'email' })

			logError(error)

			expect(console.error).toHaveBeenCalledTimes(2) // One for formatted message, one for details
			const calls = (console.error as ReturnType<typeof vi.fn>).mock.calls
			const detailsCall = calls.find(call => call[0] === 'Error details:')
			expect(detailsCall).toBeDefined()
			expect(detailsCall).not.toBeUndefined()
			expect(detailsCall![1]).toEqual({ field: 'email' })
		})

		it('should include context in log', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error')
			const context = { operation: 'create', userId: '123' }

			logError(error, context)

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Context:'),
				expect.objectContaining({ operation: 'create', userId: '123' })
			)
		})

		it('should include timestamp in log', () => {
			const error = createAppError('VALIDATION_ERROR', 'Test error')

			logError(error)

			expect(console.error).toHaveBeenCalledTimes(1)
			const calls = (console.error as ReturnType<typeof vi.fn>).mock.calls
			expect(calls.length).toBeGreaterThan(0)
			const callArgs = calls[0]!
			const logMessage = callArgs[1] as string
			expect(logMessage).toContain('Timestamp:')
		})
	})

	describe('logWarning', () => {
		it('should log warning to console.warn', () => {
			logWarning('Test warning')

			expect(console.warn).toHaveBeenCalledTimes(1)
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('[WARNING]'),
				expect.stringContaining('Test warning')
			)
		})

		it('should include context in warning log', () => {
			const context = { operation: 'update', id: '123' }

			logWarning('Test warning', context)

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Context:'),
				expect.objectContaining({ operation: 'update', id: '123' })
			)
		})
	})

	describe('logInfo', () => {
		it('should log info to console.info', () => {
			logInfo('Test info')

			expect(console.info).toHaveBeenCalledTimes(1)
			expect(console.info).toHaveBeenCalledWith(
				expect.stringContaining('[INFO]'),
				expect.stringContaining('Test info')
			)
		})

		it('should include context in info log', () => {
			const context = { operation: 'fetch', resource: 'users' }

			logInfo('Test info', context)

			expect(console.info).toHaveBeenCalledWith(
				expect.stringContaining('Context:'),
				expect.objectContaining({ operation: 'fetch', resource: 'users' })
			)
		})
	})

	describe('logDebug', () => {
		it('should log debug to console.debug in development', () => {
			logDebug('Test debug')

			expect(console.debug).toHaveBeenCalledTimes(1)
			expect(console.debug).toHaveBeenCalledWith(
				expect.stringContaining('[DEBUG]'),
				expect.stringContaining('Test debug')
			)
		})

		it('should include context in debug log', () => {
			const context = { step: 'validation', data: { test: true } }

			logDebug('Test debug', context)

			expect(console.debug).toHaveBeenCalledWith(
				expect.stringContaining('Context:'),
				expect.objectContaining({ step: 'validation', data: { test: true } })
			)
		})
	})
})
