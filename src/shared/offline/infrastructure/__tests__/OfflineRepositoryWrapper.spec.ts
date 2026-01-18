import { beforeEach, describe, expect, it, vi } from 'vitest'

import { unwrap } from '@/shared/domain/Result'
import { Ok, type Result } from '@/shared/domain/Result'
import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'
import { withOfflineSupport } from '@/shared/offline/infrastructure/OfflineRepositoryWrapper'

// Mock repository for testing
type TestRepository = Record<string, (...args: unknown[]) => Promise<unknown>> & {
	create(data: { name: string }): Promise<Result<{ id: string; name: string }, { code: string; message: string }>>
	update(id: string, data: Partial<{ name: string }>): Promise<Result<{ id: string; name: string }, { code: string; message: string }>>
	delete(id: string): Promise<Result<void, { code: string; message: string }>>
	findById(id: string): Promise<Result<{ id: string; name: string } | null, { code: string; message: string }>>
}

describe('withOfflineSupport', () => {
	let mockRepository: TestRepository
	let mockQueue: OfflineQueueRepository

	beforeEach(() => {
		vi.clearAllMocks()

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

		Object.defineProperty(globalThis, 'localStorage', {
			value: localStorageMock,
			writable: true,
			configurable: true,
		})

		// Mock repository
		mockRepository = {
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findById: vi.fn(),
		}

		// Mock queue
		mockQueue = createOfflineQueueRepository()

		// Mock navigator.onLine
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		})
	})

	describe('when online', () => {
		it('should call original create method when online', async () => {
			const testData = { name: 'Test' }
			const expectedResult = Ok({ id: '123', name: 'Test' })
			mockRepository.create = vi.fn().mockResolvedValue(expectedResult)

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				configurable: true,
				value: true,
			})

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = (await wrapped.create(testData)) as Result<{ id: string; name: string }, { code: string; message: string }>

			expect(mockRepository.create).toHaveBeenCalledWith(testData)
			expect(result.success).toBe(true)
			expect(unwrap(result)).toEqual({ id: '123', name: 'Test' })
		})

		it('should call original update method when online', async () => {
			const expectedResult = Ok({ id: '123', name: 'Updated' })
			mockRepository.update = vi.fn().mockResolvedValue(expectedResult)

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				configurable: true,
				value: true,
			})

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = (await wrapped.update('123', { name: 'Updated' })) as Result<{ id: string; name: string }, { code: string; message: string }>

			expect(mockRepository.update).toHaveBeenCalledWith('123', { name: 'Updated' })
			expect(result.success).toBe(true)
		})

		it('should call original delete method when online', async () => {
			const expectedResult = Ok(undefined)
			mockRepository.delete = vi.fn().mockResolvedValue(expectedResult)

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				configurable: true,
				value: true,
			})

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = (await wrapped.delete('123')) as Result<void, { code: string; message: string }>

			expect(mockRepository.delete).toHaveBeenCalledWith('123')
			expect(result.success).toBe(true)
		})

		it('should not wrap read-only methods like findById', async () => {
			const expectedResult = Ok({ id: '123', name: 'Test' })
			mockRepository.findById = vi.fn().mockResolvedValue(expectedResult)

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = await wrapped.findById('123')

			expect(mockRepository.findById).toHaveBeenCalledWith('123')
			expect(result.success).toBe(true)
		})
	})

	describe('when offline', () => {
		it('should queue create operation when offline', async () => {
			const testData = { name: 'Test' }

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				configurable: true,
				value: false,
			})

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = (await wrapped.create(testData)) as Result<{ id: string; name: string }, { code: string; message: string }>

			// Should not call the original repository
			expect(mockRepository.create).not.toHaveBeenCalled()

			// Should return optimistic result
			expect(result.success).toBe(true)
			const resultValue = unwrap(result)
			expect(resultValue).toMatchObject(testData)
			expect(resultValue).toHaveProperty('id')

			// Should add operation to queue
			const queueResult = await mockQueue.getAll()
			expect(queueResult.success).toBe(true)
			const operations = unwrap(queueResult)
			expect(operations.length).toBeGreaterThan(0)
			const firstOp = operations[0]
			expect(firstOp?.type).toBe('create')
			expect(firstOp?.entity).toBe('test-entity')
		})

		it('should queue update operation when offline', async () => {
			const updateData = { name: 'Updated' }

			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				configurable: true,
				value: false,
			})

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = await wrapped.update('123', updateData)

			expect(mockRepository.update).not.toHaveBeenCalled()

			// Should return optimistic result
			expect(result.success).toBe(true)

			// Should add operation to queue
			const queueResult = await mockQueue.getAll()
			expect(queueResult.success).toBe(true)
			const updateOp = unwrap(queueResult).find((op) => op.type === 'update')
			expect(updateOp).toBeDefined()
			expect(updateOp?.entity).toBe('test-entity')
		})

		it('should queue delete operation when offline', async () => {
			Object.defineProperty(navigator, 'onLine', {
				writable: true,
				configurable: true,
				value: false,
			})

			const wrapped = withOfflineSupport(mockRepository, 'test-entity', mockQueue)

			const result = (await wrapped.delete('123')) as Result<void, { code: string; message: string }>

			expect(mockRepository.delete).not.toHaveBeenCalled()

			// Should return optimistic result
			expect(result.success).toBe(true)

			// Should add operation to queue
			const queueResult = await mockQueue.getAll()
			expect(queueResult.success).toBe(true)
			const deleteOp = unwrap(queueResult).find((op) => op.type === 'delete')
			expect(deleteOp).toBeDefined()
		})
	})
})
