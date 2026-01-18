import { beforeEach, describe, expect, it, vi } from 'vitest'

import { unwrap } from '@/shared/domain/Result'
import { createOfflineOperation } from '@/shared/offline/domain/OfflineOperation'
import { LocalStorageOfflineQueue } from '@/shared/offline/infrastructure/LocalStorageOfflineQueue'

describe('LocalStorageOfflineQueue', () => {
	const STORAGE_KEY = 'gerocare_offline_queue'
	const MAX_OPERATIONS = 100

	beforeEach(() => {
		// Mock localStorage for tests
		const localStorageMock = (() => {
			let store: Record<string, string> = {}
			return {
				getItem: (key: string) => store[key] || null,
				setItem: (key: string, value: string) => {
					store[key] = value.toString()
				},
				removeItem: (key: string) => {
					delete store[key]
				},
				clear: () => {
					store = {}
				},
			}
		})()

		// Set up localStorage mock on global object
		Object.defineProperty(globalThis, 'localStorage', {
			value: localStorageMock,
			writable: true,
			configurable: true,
		})

		// Clear before each test
		localStorage.clear()
		vi.clearAllMocks()
	})

	describe('add', () => {
		it('should add an operation to localStorage', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const operation = createOfflineOperation('create', 'resident', { name: 'Test' })

			const result = await queue.add(operation)

			expect(result.success).toBe(true)

			const stored = localStorage.getItem(STORAGE_KEY)
			expect(stored).toBeTruthy()

			const parsed = JSON.parse(stored!)
			expect(parsed).toHaveLength(1)
			expect(parsed[0].id).toBe(operation.id)
		})

		it('should add multiple operations', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const op1 = createOfflineOperation('create', 'resident', { name: 'Test 1' })
			const op2 = createOfflineOperation('update', 'resident', { id: '123', name: 'Test 2' })

			await queue.add(op1)
			const result = await queue.add(op2)

			expect(result.success).toBe(true)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			expect(unwrap(allResult)).toHaveLength(2)
		})

		it('should return QUEUE_FULL error when max operations reached', async () => {
			const maxOps = 2
			const queue = new LocalStorageOfflineQueue(maxOps)

			const op1 = createOfflineOperation('create', 'resident', { name: 'Test 1' })
			const op2 = createOfflineOperation('create', 'resident', { name: 'Test 2' })
			const op3 = createOfflineOperation('create', 'resident', { name: 'Test 3' })

			await queue.add(op1)
			await queue.add(op2)

			const result = await queue.add(op3)

			expect(result.success).toBe(false)
			expect(result.success ? undefined : result.error.code).toBe('QUEUE_FULL')
		})

		it('should serialize operation correctly with Date objects', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const operation = createOfflineOperation('create', 'resident', { name: 'Test' })

			await queue.add(operation)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			const retrieved = unwrap(allResult)[0]
			expect(retrieved.timestamp).toBeInstanceOf(Date)
			expect(retrieved.id).toBe(operation.id)
		})
	})

	describe('getAll', () => {
		it('should return empty array when queue is empty', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)

			const result = await queue.getAll()

			expect(result.success).toBe(true)
			expect(unwrap(result)).toEqual([])
		})

		it('should return all operations', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const op1 = createOfflineOperation('create', 'resident', { name: 'Test 1' })
			const op2 = createOfflineOperation('update', 'resident', { id: '123' })

			await queue.add(op1)
			await queue.add(op2)

			const result = await queue.getAll()

			expect(result.success).toBe(true)
			const operations = unwrap(result)
			expect(operations).toHaveLength(2)
			expect(operations.map(o => o.id)).toContain(op1.id)
			expect(operations.map(o => o.id)).toContain(op2.id)
		})

		it('should deserialize Date objects correctly', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const operation = createOfflineOperation('create', 'resident', {})

			await queue.add(operation)

			const result = await queue.getAll()
			expect(result.success).toBe(true)
			const retrieved = unwrap(result)[0]
			expect(retrieved.timestamp).toBeInstanceOf(Date)
		})

		it('should handle corrupted localStorage data gracefully', async () => {
			localStorage.setItem(STORAGE_KEY, 'invalid json')

			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)

			const result = await queue.getAll()

			expect(result.success).toBe(true)
			// Should reset to empty array
			expect(unwrap(result)).toEqual([])
		})
	})

	describe('remove', () => {
		it('should remove an operation by id', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const op1 = createOfflineOperation('create', 'resident', { name: 'Test 1' })
			const op2 = createOfflineOperation('create', 'resident', { name: 'Test 2' })

			await queue.add(op1)
			await queue.add(op2)

			const result = await queue.remove(op1.id)

			expect(result.success).toBe(true)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			const operations = unwrap(allResult)
			expect(operations).toHaveLength(1)
			expect(operations[0].id).toBe(op2.id)
		})

		it('should handle removing non-existent operation', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)

			const result = await queue.remove('non-existent-id')

			expect(result.success).toBe(true)
		})

		it('should remove the only operation', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const operation = createOfflineOperation('create', 'resident', {})

			await queue.add(operation)
			await queue.remove(operation.id)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			expect(unwrap(allResult)).toHaveLength(0)
		})
	})

	describe('clear', () => {
		it('should remove all operations', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const op1 = createOfflineOperation('create', 'resident', {})
			const op2 = createOfflineOperation('update', 'resident', {})

			await queue.add(op1)
			await queue.add(op2)

			const result = await queue.clear()

			expect(result.success).toBe(true)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			expect(unwrap(allResult)).toHaveLength(0)
		})

		it('should clear empty queue', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)

			const result = await queue.clear()

			expect(result.success).toBe(true)
		})
	})

	describe('incrementRetries', () => {
		it('should increment retries for an operation', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const operation = createOfflineOperation('create', 'resident', {})

			await queue.add(operation)

			const result = await queue.incrementRetries(operation.id)

			expect(result.success).toBe(true)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			const updated = unwrap(allResult).find(o => o.id === operation.id)
			expect(updated?.retries).toBe(1)
		})

		it('should increment retries multiple times', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)
			const operation = createOfflineOperation('create', 'resident', {})

			await queue.add(operation)
			await queue.incrementRetries(operation.id)
			await queue.incrementRetries(operation.id)

			const allResult = await queue.getAll()
			expect(allResult.success).toBe(true)
			const updated = unwrap(allResult).find(o => o.id === operation.id)
			expect(updated?.retries).toBe(2)
		})

		it('should return error for non-existent operation', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)

			const result = await queue.incrementRetries('non-existent-id')

			expect(result.success).toBe(false)
			expect(result.success ? undefined : result.error.code).toBe('NOT_FOUND')
		})
	})

	describe('localStorage edge cases', () => {
		it('should handle localStorage quota exceeded', async () => {
			const queue = new LocalStorageOfflineQueue(MAX_OPERATIONS)

			// Mock localStorage.setItem to throw quota exceeded error
			const originalSetItem = localStorage.setItem.bind(localStorage)
			localStorage.setItem = vi.fn(() => {
				// Create a proper DOMException
				const error = new Error('QuotaExceededError') as DOMException
				error.name = 'QuotaExceededError'
				Object.setPrototypeOf(error, DOMException.prototype)
				throw error
			})

			const operation = createOfflineOperation('create', 'resident', {})

			const result = await queue.add(operation)

			expect(result.success).toBe(false)
			// When quota is exceeded, we return QUEUE_FULL error
			expect(result.success ? undefined : result.error.code).toBe('QUEUE_FULL')

			// Restore original
			localStorage.setItem = originalSetItem
		})
	})
})
