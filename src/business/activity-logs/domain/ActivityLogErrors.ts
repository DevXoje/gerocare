import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type ActivityLogError = AppError

export type ActivityLogErrorCode =
	| 'VALIDATION_ERROR'
	| 'NOT_FOUND'
	| 'CREATE_FAILED'
	| 'UPDATE_FAILED'
	| 'DELETE_FAILED'
	| 'REPOSITORY_ERROR'

export function createActivityLogValidationError(message: string): ActivityLogError {
	return createAppError('VALIDATION_ERROR', message)
}

export function createActivityLogNotFoundError(id?: string): ActivityLogError {
	return createAppError(
		'NOT_FOUND',
		id
			? `No se encontró el registro de actividad con ID ${id}`
			: 'Registro de actividad no encontrado',
		id ? { activityLogId: id } : undefined
	)
}

export function createActivityLogCreateFailedError(message?: string): ActivityLogError {
	return createAppError('CREATE_FAILED', message || 'Error al crear el registro de actividad')
}

export function createActivityLogUpdateFailedError(message?: string): ActivityLogError {
	return createAppError('UPDATE_FAILED', message || 'Error al actualizar el registro de actividad')
}

export function createActivityLogDeleteFailedError(message?: string): ActivityLogError {
	return createAppError('DELETE_FAILED', message || 'Error al eliminar el registro de actividad')
}

export function createActivityLogRepositoryError(message: string): ActivityLogError {
	return createAppError('REPOSITORY_ERROR', message)
}
