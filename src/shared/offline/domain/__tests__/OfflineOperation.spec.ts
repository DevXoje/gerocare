import { describe, expect, it } from 'vitest'

import {
	createOfflineOperation,
	incrementRetries,
	isExpired,
	type OfflineOperation,
} from '@/shared/offline/domain/OfflineOperation'

describe('OfflineOperation', () => {
	describe('createOfflineOperation', () => {
		it('should create an offline operation with all required fields', () => {
			const data = { name: 'Test Resident', age: 75 }
			const operation = createOfflineOperation('create', 'resident', data)

			expect(operation.id).toBeDefined()
			expect(operation.type).toBe('create')
			expect(operation.entity).toBe('resident')
			expect(operation.data).toEqual(data)
			expect(operation.timestamp).toBeInstanceOf(Date)
			expect(operation.retries).toBe(0)
		})

		it('should create operation with unique IDs', () => {
			const data = { name: 'Test' }
			const op1 = createOfflineOperation('create', 'resident', data)
			const op2 = createOfflineOperation('create', 'resident', data)

			expect(op1.id).not.toBe(op2.id)
		})

		it('should support all operation types', () => {
			const data = { id: '123' }

			const createOp = createOfflineOperation('create', 'resident', data)
			expect(createOp.type).toBe('create')

			const updateOp = createOfflineOperation('update', 'resident', data)
			expect(updateOp.type).toBe('update')

			const deleteOp = createOfflineOperation('delete', 'resident', data)
			expect(deleteOp.type).toBe('delete')
		})
	})

	describe('incrementRetries', () => {
		it('should increment retries count', () => {
			const operation = createOfflineOperation('create', 'resident', {})
			expect(operation.retries).toBe(0)

			const updated = incrementRetries(operation)
			expect(updated.retries).toBe(1)
		})

		it('should not mutate original operation', () => {
			const operation = createOfflineOperation('create', 'resident', {})
			const originalRetries = operation.retries

			incrementRetries(operation)

			expect(operation.retries).toBe(originalRetries)
		})

		it('should create a new operation instance', () => {
			const operation = createOfflineOperation('create', 'resident', {})
			const updated = incrementRetries(operation)

			expect(updated).not.toBe(operation)
			expect(updated.id).toBe(operation.id)
			expect(updated.retries).toBe(operation.retries + 1)
		})
	})

	describe('isExpired', () => {
		it('should return false for recent operations', () => {
			const operation = createOfflineOperation('create', 'resident', {})
			expect(isExpired(operation, 7 * 24 * 60 * 60 * 1000)).toBe(false)
		})

		it('should return true for expired operations', () => {
			const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
			const operation: OfflineOperation = {
				id: 'test-id',
				type: 'create',
				entity: 'resident',
				data: {},
				timestamp: oldDate,
				retries: 0,
			}

			expect(isExpired(operation, 7 * 24 * 60 * 60 * 1000)).toBe(true)
		})

		it('should use custom expiration time', () => {
			const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
			const operation: OfflineOperation = {
				id: 'test-id',
				type: 'create',
				entity: 'resident',
				data: {},
				timestamp: oldDate,
				retries: 0,
			}

			expect(isExpired(operation, 60 * 60 * 1000)).toBe(true) // 1 hour expiration
			expect(isExpired(operation, 3 * 60 * 60 * 1000)).toBe(false) // 3 hours expiration
		})
	})

	describe('OfflineOperation type', () => {
		it('should have correct type structure', () => {
			const operation: OfflineOperation = createOfflineOperation('create', 'resident', {})

			expect(operation).toHaveProperty('id')
			expect(operation).toHaveProperty('type')
			expect(operation).toHaveProperty('entity')
			expect(operation).toHaveProperty('data')
			expect(operation).toHaveProperty('timestamp')
			expect(operation).toHaveProperty('retries')

			expect(typeof operation.id).toBe('string')
			expect(['create', 'update', 'delete']).toContain(operation.type)
			expect(typeof operation.entity).toBe('string')
			expect(operation.timestamp).toBeInstanceOf(Date)
			expect(typeof operation.retries).toBe('number')
		})
	})
})
