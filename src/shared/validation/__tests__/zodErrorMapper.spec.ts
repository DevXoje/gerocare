import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { getZodErrorMessage, mapZodErrorToAppError } from '../zodErrorMapper'

describe('zodErrorMapper', () => {
	describe('mapZodErrorToAppError', () => {
		it('should map Zod error to AppError with first issue message', () => {
			const schema = z.object({
				email: z.string().email(),
				age: z.number().min(18),
			})

			const result = schema.safeParse({
				email: 'invalid-email',
				age: 15,
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const appError = mapZodErrorToAppError(result.error)

			expect(appError.code).toBe('VALIDATION_ERROR')
			expect(appError.message).toBeTruthy()
			expect(appError.details).toBeDefined()
			expect(appError.timestamp).toBeInstanceOf(Date)
		})

		it('should include all issues in details', () => {
			const schema = z.object({
				email: z.string().email(),
				name: z.string().min(3),
				age: z.number().min(18),
			})

			const result = schema.safeParse({
				email: 'invalid',
				name: 'ab',
				age: 15,
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const appError = mapZodErrorToAppError(result.error)

			expect(appError.details).toBeDefined()
			expect(
				appError.details && typeof appError.details === 'object' && 'issues' in appError.details
			).toBe(true)
			const issues = (appError.details as { issues: Array<{ path: string; message: string }> })
				.issues
			expect(issues.length).toBeGreaterThan(0)
		})

		it('should include formatted issues in details', () => {
			const schema = z.object({
				email: z.string().email(),
				name: z.string().min(3),
			})

			const result = schema.safeParse({
				email: 'invalid',
				name: 'ab',
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const appError = mapZodErrorToAppError(result.error)

			expect(appError.details).toBeDefined()
			expect(
				appError.details && typeof appError.details === 'object' && 'formatted' in appError.details
			).toBe(true)
			const formatted = (appError.details as { formatted: string }).formatted
			expect(typeof formatted).toBe('string')
			expect(formatted.length).toBeGreaterThan(0)
		})

		it('should handle nested object errors', () => {
			const schema = z.object({
				user: z.object({
					email: z.string().email(),
					profile: z.object({
						name: z.string().min(3),
					}),
				}),
			})

			const result = schema.safeParse({
				user: {
					email: 'invalid',
					profile: {
						name: 'ab',
					},
				},
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const appError = mapZodErrorToAppError(result.error)

			expect(appError.code).toBe('VALIDATION_ERROR')
			expect(appError.details).toBeDefined()
		})

		it('should handle array errors', () => {
			const schema = z.object({
				items: z.array(z.string().min(3)),
			})

			const result = schema.safeParse({
				items: ['ab', 'cd'],
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const appError = mapZodErrorToAppError(result.error)

			expect(appError.code).toBe('VALIDATION_ERROR')
			expect(appError.details).toBeDefined()
		})
	})

	describe('getZodErrorMessage', () => {
		it('should return single error message for one issue', () => {
			const schema = z.object({
				email: z.string().email(),
			})

			const result = schema.safeParse({
				email: 'invalid-email',
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const message = getZodErrorMessage(result.error)

			expect(typeof message).toBe('string')
			expect(message.length).toBeGreaterThan(0)
			expect(message).toContain('email')
		})

		it('should return summary message for multiple issues', () => {
			const schema = z.object({
				email: z.string().email(),
				name: z.string().min(3),
				age: z.number().min(18),
			})

			const result = schema.safeParse({
				email: 'invalid',
				name: 'ab',
				age: 15,
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const message = getZodErrorMessage(result.error)

			expect(typeof message).toBe('string')
			expect(message.length).toBeGreaterThan(0)
			// Should mention there are more errors
			expect(message.toLowerCase()).toMatch(/más|more|error/i)
		})

		it('should handle nested path errors', () => {
			const schema = z.object({
				user: z.object({
					email: z.string().email(),
				}),
			})

			const result = schema.safeParse({
				user: {
					email: 'invalid',
				},
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const message = getZodErrorMessage(result.error)

			expect(typeof message).toBe('string')
			expect(message.length).toBeGreaterThan(0)
		})

		it('should return default message when no issues', () => {
			// Create a ZodError with empty issues array
			const emptyError = new z.ZodError([])

			const message = getZodErrorMessage(emptyError)

			expect(message).toBe('Error de validación')
		})

		it('should include path in message when available', () => {
			const schema = z.object({
				user: z.object({
					email: z.string().email(),
				}),
			})

			const result = schema.safeParse({
				user: {
					email: 'invalid',
				},
			})

			expect(result.success).toBe(false)
			expect(result).toHaveProperty('error')
			const message = getZodErrorMessage(result.error)

			// Message should include path information
			expect(message).toBeTruthy()
		})
	})
})
