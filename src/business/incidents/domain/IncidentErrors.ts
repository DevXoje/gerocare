export interface IncidentError {
  code: string
  message: string
}

export function createIncidentNotFoundError(message: string = 'Incident not found'): IncidentError {
  return {
    code: 'INCIDENT_NOT_FOUND',
    message,
  }
}

export function createIncidentValidationError(message: string): IncidentError {
  return {
    code: 'INCIDENT_VALIDATION_ERROR',
    message,
  }
}

export function createIncidentPermissionError(message: string = 'Permission denied'): IncidentError {
  return {
    code: 'INCIDENT_PERMISSION_ERROR',
    message,
  }
}

export function createUnknownIncidentError(message: string = 'Unknown error'): IncidentError {
  return {
    code: 'UNKNOWN_INCIDENT_ERROR',
    message,
  }
}
