import type { Result } from '@/shared/domain/Result'

export interface ActivityLogError {
  code: ActivityLogErrorCode
  message: string
}

export type ActivityLogErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CREATE_FAILED'
  | 'UPDATE_FAILED'
  | 'DELETE_FAILED'
  | 'REPOSITORY_ERROR'

export function createActivityLogValidationError(message: string): ActivityLogError {
  return {
    code: 'VALIDATION_ERROR',
    message,
  }
}

export function createActivityLogNotFoundError(id?: string): ActivityLogError {
  return {
    code: 'NOT_FOUND',
    message: id ? `Activity log with id ${id} not found` : 'Activity log not found',
  }
}

export function createActivityLogCreateFailedError(message?: string): ActivityLogError {
  return {
    code: 'CREATE_FAILED',
    message: message || 'Failed to create activity log',
  }
}

export function createActivityLogUpdateFailedError(message?: string): ActivityLogError {
  return {
    code: 'UPDATE_FAILED',
    message: message || 'Failed to update activity log',
  }
}

export function createActivityLogDeleteFailedError(message?: string): ActivityLogError {
  return {
    code: 'DELETE_FAILED',
    message: message || 'Failed to delete activity log',
  }
}

export function createActivityLogRepositoryError(message: string): ActivityLogError {
  return {
    code: 'REPOSITORY_ERROR',
    message,
  }
}
