import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type MedicationError = AppError

export function createMedicationNotFoundError(
	message: string = 'Medicación no encontrada'
): MedicationError {
	return createAppError('NOT_FOUND', message)
}

export function createMedicationValidationError(message: string): MedicationError {
	return createAppError('VALIDATION_ERROR', message)
}

export function createMedicationPermissionError(
	message: string = 'Permiso denegado'
): MedicationError {
	return createAppError('PERMISSION_ERROR', message)
}

export function createUnknownMedicationError(
	message: string = 'Error desconocido'
): MedicationError {
	return createAppError('UNKNOWN_ERROR', message)
}
