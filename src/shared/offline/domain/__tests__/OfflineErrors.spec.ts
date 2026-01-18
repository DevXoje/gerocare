import { describe, expect, it } from 'vitest'

import type { OfflineError } from '@/shared/offline/domain/OfflineErrors'
import {
	createOfflineOperationExpiredError,
	createOfflineQueueFullError,
	createOfflineSyncFailedError,
	createUnknownOfflineError,
} from '@/shared/offline/domain/OfflineErrors'

describe('OfflineErrors', () => {
	describe('createOfflineQueueFullError', () => {
		it('should create a QUEUE_FULL error with default message', () => {
			const error = createOfflineQueueFullError()

			expect(error.code).toBe('QUEUE_FULL')
			expect(error.message).toBe('La cola de operaciones offline está llena')
			expect(error.timestamp).toBeInstanceOf(Date)
		})

		it('should create a QUEUE_FULL error with custom message', () => {
			const customMessage = 'Cola llena, límite alcanzado'
			const error = createOfflineQueueFullError(customMessage)

			expect(error.code).toBe('QUEUE_FULL')
			expect(error.message).toBe(customMessage)
		})
	})

	describe('createOfflineOperationExpiredError', () => {
		it('should create an OPERATION_EXPIRED error with default message', () => {
			const error = createOfflineOperationExpiredError()

			expect(error.code).toBe('OPERATION_EXPIRED')
			expect(error.message).toBe('La operación offline ha expirado')
			expect(error.timestamp).toBeInstanceOf(Date)
		})

		it('should create an OPERATION_EXPIRED error with custom message', () => {
			const customMessage = 'Operación expirada después de 7 días'
			const error = createOfflineOperationExpiredError(customMessage)

			expect(error.code).toBe('OPERATION_EXPIRED')
			expect(error.message).toBe(customMessage)
		})
	})

	describe('createOfflineSyncFailedError', () => {
		it('should create a SYNC_FAILED error with default message', () => {
			const error = createOfflineSyncFailedError()

			expect(error.code).toBe('SYNC_FAILED')
			expect(error.message).toBe('Error al sincronizar operaciones offline')
			expect(error.timestamp).toBeInstanceOf(Date)
		})

		it('should create a SYNC_FAILED error with custom message', () => {
			const customMessage = 'Error de sincronización: red no disponible'
			const error = createOfflineSyncFailedError(customMessage)

			expect(error.code).toBe('SYNC_FAILED')
			expect(error.message).toBe(customMessage)
		})
	})

	describe('createUnknownOfflineError', () => {
		it('should create an UNKNOWN_ERROR with default message', () => {
			const error = createUnknownOfflineError()

			expect(error.code).toBe('UNKNOWN_OFFLINE_ERROR')
			expect(error.message).toBe('Error desconocido en operación offline')
			expect(error.timestamp).toBeInstanceOf(Date)
		})

		it('should create an UNKNOWN_ERROR with custom message', () => {
			const customMessage = 'Error inesperado en la cola'
			const error = createUnknownOfflineError(customMessage)

			expect(error.code).toBe('UNKNOWN_OFFLINE_ERROR')
			expect(error.message).toBe(customMessage)
		})
	})

	describe('OfflineError type', () => {
		it('should satisfy AppError interface', () => {
			const error: OfflineError = createOfflineQueueFullError()

			expect(error).toHaveProperty('code')
			expect(error).toHaveProperty('message')
			expect(error).toHaveProperty('timestamp')
			expect(typeof error.code).toBe('string')
			expect(typeof error.message).toBe('string')
			expect(error.timestamp).toBeInstanceOf(Date)
		})
	})
})
