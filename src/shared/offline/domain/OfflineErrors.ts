import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type OfflineError = AppError

export function createOfflineQueueFullError(
	message: string = 'La cola de operaciones offline está llena'
): OfflineError {
	return createAppError('QUEUE_FULL', message)
}

export function createOfflineOperationExpiredError(
	message: string = 'La operación offline ha expirado'
): OfflineError {
	return createAppError('OPERATION_EXPIRED', message)
}

export function createOfflineSyncFailedError(
	message: string = 'Error al sincronizar operaciones offline'
): OfflineError {
	return createAppError('SYNC_FAILED', message)
}

export function createUnknownOfflineError(
	message: string = 'Error desconocido en operación offline'
): OfflineError {
	return createAppError('UNKNOWN_OFFLINE_ERROR', message)
}
