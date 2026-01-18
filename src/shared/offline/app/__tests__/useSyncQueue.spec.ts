import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { unwrap } from '@/shared/domain/Result'
import { Err, Ok } from '@/shared/domain/Result'
import { createOfflineOperation } from '@/shared/offline/domain/OfflineOperation'
import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'
import { createOfflineQueueRepository } from '@/shared/offline/infrastructure/index'

import { useSyncQueue } from '../useSyncQueue'

// Mock repository for testing
interface MockRepository {
	create(data: unknown): Promise<Result<unknown, unknown>>
	update(id: string, updates: unknown): Promise<Result<unknown, unknown>>
	delete(id: string): Promise<Result<void, unknown>>
}

describe('useSyncQueue', () => {
	let mockQueue: OfflineQueueRepository
	let mockRepository: MockRepository

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()

		// Mock localStorage
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

		mockQueue = createOfflineQueueRepository()

		// Mock repository
		mockRepository = {
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		}

		// Mock navigator.onLine
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			configurable: true,
			value: true,
		})
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should initialize with empty state', () => {
		const { isSyncing, pendingOperations, failedOperations } = useSyncQueue(mockQueue, {})

		expect(isSyncing.value).toBe(false)
		expect(pendingOperations.value).toBe(0)
		expect(failedOperations.value).toBe(0)
	})

	it('should sync create operation successfully', async () => {
		const operation = createOfflineOperation('create', 'resident', { name: 'Test' })
		await mockQueue.add(operation)

		mockRepository.create = vi.fn().mockResolvedValue(Ok({ id: '123', name: 'Test' }))

		const { sync } = useSyncQueue(mockQueue, { resident: mockRepository })

		await sync()

		expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Test' })

		const queueResult = await mockQueue.getAll()
		expect(queueResult.success).toBe(true)
		// Operation should be removed from queue after successful sync
		expect(unwrap(queueResult).length).toBe(0)
	})

	it('should sync update operation successfully', async () => {
		const operation = createOfflineOperation('update', 'resident', {
			id: '123',
			updates: { name: 'Updated' },
		})
		await mockQueue.add(operation)

		mockRepository.update = vi.fn().mockResolvedValue(Ok({ id: '123', name: 'Updated' }))

		const { sync } = useSyncQueue(mockQueue, { resident: mockRepository })

		await sync()

		expect(mockRepository.update).toHaveBeenCalledWith('123', { name: 'Updated' })
	})

	it('should sync delete operation successfully', async () => {
		const operation = createOfflineOperation('delete', 'resident', { id: '123' })
		await mockQueue.add(operation)

		mockRepository.delete = vi.fn().mockResolvedValue(Ok(undefined))

		const { sync } = useSyncQueue(mockQueue, { resident: mockRepository })

		await sync()

		expect(mockRepository.delete).toHaveBeenCalledWith('123')
	})

	it('should handle sync errors and increment retries', async () => {
		const operation = createOfflineOperation('create', 'resident', { name: 'Test' })
		await mockQueue.add(operation)

		mockRepository.create = vi.fn().mockResolvedValue(Err({ code: 'ERROR', message: 'Failed' }))

		const { sync } = useSyncQueue(mockQueue, { resident: mockRepository })

		await sync()

		const queueResult = await mockQueue.getAll()
		expect(queueResult.success).toBe(true)
		const operations = unwrap(queueResult)
		// Operation should remain in queue
		expect(operations.length).toBe(1)
		// Retries should be incremented
		expect(operations[0].retries).toBe(1)
	})

	it('should not sync when queue is empty', async () => {
		const { sync } = useSyncQueue(mockQueue, { resident: mockRepository })

		await sync()

		expect(mockRepository.create).not.toHaveBeenCalled()
		expect(mockRepository.update).not.toHaveBeenCalled()
		expect(mockRepository.delete).not.toHaveBeenCalled()
	})
})
