import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type ShiftError = AppError

export function createShiftNotFoundError(message: string = 'Turno no encontrado'): ShiftError {
	return createAppError('NOT_FOUND', message)
}

export function createShiftValidationError(message: string): ShiftError {
	return createAppError('VALIDATION_ERROR', message)
}

export function createShiftPermissionError(message: string = 'Permiso denegado'): ShiftError {
	return createAppError('PERMISSION_ERROR', message)
}

export function createUnknownShiftError(message: string = 'Error desconocido'): ShiftError {
	return createAppError('UNKNOWN_ERROR', message)
}
