export interface MedicationError {
  code: string
  message: string
}

export function createMedicationNotFoundError(message: string = 'Medication not found'): MedicationError {
  return {
    code: 'MEDICATION_NOT_FOUND',
    message,
  }
}

export function createMedicationValidationError(message: string): MedicationError {
  return {
    code: 'MEDICATION_VALIDATION_ERROR',
    message,
  }
}

export function createMedicationPermissionError(message: string = 'Permission denied'): MedicationError {
  return {
    code: 'MEDICATION_PERMISSION_ERROR',
    message,
  }
}

export function createUnknownMedicationError(message: string = 'Unknown error'): MedicationError {
  return {
    code: 'UNKNOWN_MEDICATION_ERROR',
    message,
  }
}
