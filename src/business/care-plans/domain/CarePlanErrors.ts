import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type CarePlanError = AppError

export function createCarePlanNotFoundError(
	message: string = 'Plan de cuidado no encontrado'
): CarePlanError {
	return createAppError('NOT_FOUND', message)
}

export function createCarePlanValidationError(message: string): CarePlanError {
	return createAppError('VALIDATION_ERROR', message)
}

export function createCarePlanPermissionError(message: string = 'Permiso denegado'): CarePlanError {
	return createAppError('PERMISSION_ERROR', message)
}

export function createUnknownCarePlanError(message: string = 'Error desconocido'): CarePlanError {
	return createAppError('UNKNOWN_ERROR', message)
}
