import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type ResidentError = AppError

export function createResidentNotFoundError(
	message: string = 'Residente no encontrado'
): ResidentError {
	return createAppError('NOT_FOUND', message)
}

export function createResidentValidationError(message: string): ResidentError {
	return createAppError('VALIDATION_ERROR', message)
}

export function createResidentPermissionError(message: string = 'Permiso denegado'): ResidentError {
	return createAppError('PERMISSION_ERROR', message)
}

export function createUnknownResidentError(message: string = 'Error desconocido'): ResidentError {
	return createAppError('UNKNOWN_ERROR', message)
}
