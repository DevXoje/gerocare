import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type IncidentError = AppError

export function createIncidentNotFoundError(
	message: string = 'Incidente no encontrado'
): IncidentError {
	return createAppError('NOT_FOUND', message)
}

export function createIncidentValidationError(message: string): IncidentError {
	return createAppError('VALIDATION_ERROR', message)
}

export function createIncidentPermissionError(message: string = 'Permiso denegado'): IncidentError {
	return createAppError('PERMISSION_ERROR', message)
}

export function createUnknownIncidentError(message: string = 'Error desconocido'): IncidentError {
	return createAppError('UNKNOWN_ERROR', message)
}
