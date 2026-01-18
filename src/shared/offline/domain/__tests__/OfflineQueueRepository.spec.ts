import { describe, expect, it } from 'vitest'

import { unwrap } from '@/shared/domain/Result'
import { createOfflineOperation } from '@/shared/offline/domain/OfflineOperation'
import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'

/**
 * Contract tests for OfflineQueueRepository interface
 * These tests verify that any implementation of OfflineQueueRepository
 * follows the expected behavior
 *
 * Note: These are abstract contract tests that document expected behavior.
 * They will fail until a concrete repository implementation is provided via makeRepository().
 */
describe('OfflineQueueRepository contract', () => {
	/**
	 * Factory function to create a repository instance for testing
	 * This will be implemented differently for each concrete repository
	 */
	function createRepository(): OfflineQueueRepository {
		// This is a test helper - implementations will provide their own factory
		throw new Error('Repository factory must be implemented by test suite')
	}

	const makeRepository = () => {
		// Will be overridden by specific test suites
		return createRepository()
	}

	describe('add', () => {
		it('should add an operation to the queue', async () => {
			const repository = makeRepository()
			const operation = createOfflineOperation('create', 'resident', { name: 'Test' })

			const result = await repository.add(operation)

			expect(result.success).toBe(true)
		})

		it('should be able to retrieve added operations', async () => {
			const repository = makeRepository()
			const operation = createOfflineOperation('create', 'resident', { name: 'Test' })

			await repository.add(operation)
			const allResult = await repository.getAll()

			expect(allResult.success).toBe(true)
			const operations = unwrap(allResult)
			expect(operations).toHaveLength(1)
			expect(operations[0]?.id).toBe(operation.id)
		})
	})

	describe('getAll', () => {
		it('should return empty array when queue is empty', async () => {
			const repository = makeRepository()

			const result = await repository.getAll()

			expect(result.success).toBe(true)
			expect(unwrap(result)).toEqual([])
		})

		it('should return all operations in the queue', async () => {
			const repository = makeRepository()
			const op1 = createOfflineOperation('create', 'resident', { name: 'Test 1' })
			const op2 = createOfflineOperation('update', 'resident', { id: '123', name: 'Test 2' })

			await repository.add(op1)
			await repository.add(op2)

			const result = await repository.getAll()

			expect(result.success).toBe(true)
			const operations = unwrap(result)
			expect(operations).toHaveLength(2)
			expect(operations.map(o => o.id)).toContain(op1.id)
			expect(operations.map(o => o.id)).toContain(op2.id)
		})
	})

	describe('remove', () => {
		it('should remove an operation from the queue', async () => {
			const repository = makeRepository()
			const operation = createOfflineOperation('create', 'resident', { name: 'Test' })

			await repository.add(operation)
			const removeResult = await repository.remove(operation.id)

			expect(removeResult.success).toBe(true)

			const allResult = await repository.getAll()
			expect(allResult.success).toBe(true)
			expect(unwrap(allResult)).not.toContainEqual(operation)
		})

		it('should handle removing non-existent operation gracefully', async () => {
			const repository = makeRepository()

			const result = await repository.remove('non-existent-id')

			expect(result.success).toBe(true)
		})
	})

	describe('clear', () => {
		it('should remove all operations from the queue', async () => {
			const repository = makeRepository()
			const op1 = createOfflineOperation('create', 'resident', { name: 'Test 1' })
			const op2 = createOfflineOperation('update', 'resident', { id: '123' })

			await repository.add(op1)
			await repository.add(op2)

			const clearResult = await repository.clear()

			expect(clearResult.success).toBe(true)

			const allResult = await repository.getAll()
			expect(allResult.success).toBe(true)
			expect(unwrap(allResult)).toHaveLength(0)
		})
	})

	describe('incrementRetries', () => {
		it('should increment retries for an operation', async () => {
			const repository = makeRepository()
			const operation = createOfflineOperation('create', 'resident', { name: 'Test' })

			await repository.add(operation)

			const incrementResult = await repository.incrementRetries(operation.id)

			expect(incrementResult.success).toBe(true)

			const allResult = await repository.getAll()
			expect(allResult.success).toBe(true)
			const updatedOp = unwrap(allResult).find(o => o.id === operation.id)
			expect(updatedOp?.retries).toBe(1)
		})

		it('should handle incrementing retries for non-existent operation', async () => {
			const repository = makeRepository()

			const result = await repository.incrementRetries('non-existent-id')

			expect(result.success).toBe(false)
		})
	})
})
