export interface ResidentError {
  code: string
  message: string
}

export function createResidentNotFoundError(message: string = 'Resident not found'): ResidentError {
  return {
    code: 'RESIDENT_NOT_FOUND',
    message,
  }
}

export function createResidentValidationError(message: string): ResidentError {
  return {
    code: 'RESIDENT_VALIDATION_ERROR',
    message,
  }
}

export function createResidentPermissionError(message: string = 'Permission denied'): ResidentError {
  return {
    code: 'RESIDENT_PERMISSION_ERROR',
    message,
  }
}

export function createUnknownResidentError(message: string = 'Unknown error'): ResidentError {
  return {
    code: 'UNKNOWN_RESIDENT_ERROR',
    message,
  }
}

