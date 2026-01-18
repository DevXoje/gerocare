export interface CarePlanError {
  code: string
  message: string
}

export function createCarePlanNotFoundError(message: string = 'Care plan not found'): CarePlanError {
  return {
    code: 'CARE_PLAN_NOT_FOUND',
    message,
  }
}

export function createCarePlanValidationError(message: string): CarePlanError {
  return {
    code: 'CARE_PLAN_VALIDATION_ERROR',
    message,
  }
}

export function createCarePlanPermissionError(message: string = 'Permission denied'): CarePlanError {
  return {
    code: 'CARE_PLAN_PERMISSION_ERROR',
    message,
  }
}

export function createUnknownCarePlanError(message: string = 'Unknown error'): CarePlanError {
  return {
    code: 'UNKNOWN_CARE_PLAN_ERROR',
    message,
  }
}
