export interface ShiftError {
  code: string
  message: string
}

export function createShiftNotFoundError(message: string = 'Shift not found'): ShiftError {
  return {
    code: 'SHIFT_NOT_FOUND',
    message,
  }
}

export function createShiftValidationError(message: string): ShiftError {
  return {
    code: 'SHIFT_VALIDATION_ERROR',
    message,
  }
}

export function createShiftPermissionError(message: string = 'Permission denied'): ShiftError {
  return {
    code: 'SHIFT_PERMISSION_ERROR',
    message,
  }
}

export function createUnknownShiftError(message: string = 'Unknown error'): ShiftError {
  return {
    code: 'UNKNOWN_SHIFT_ERROR',
    message,
  }
}
