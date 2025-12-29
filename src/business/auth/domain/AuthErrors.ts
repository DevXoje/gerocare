// Discriminated union type for auth errors
export type AuthError =
  | { type: 'INVALID_CREDENTIALS'; message: string; code: string }
  | { type: 'USER_NOT_FOUND'; message: string; code: string }
  | { type: 'TOO_MANY_REQUESTS'; message: string; code: string }
  | { type: 'USER_DISABLED'; message: string; code: string }
  | { type: 'OPERATION_NOT_ALLOWED'; message: string; code: string }
  | { type: 'INVALID_EMAIL'; message: string; code: string }
  | { type: 'UNKNOWN'; message: string; code: string }

// Factory functions
export const createInvalidCredentialsError = (message: string = 'Credenciales inválidas'): AuthError => ({
  type: 'INVALID_CREDENTIALS',
  message,
  code: 'INVALID_CREDENTIALS',
})

export const createUserNotFoundError = (message: string = 'Usuario no encontrado'): AuthError => ({
  type: 'USER_NOT_FOUND',
  message,
  code: 'USER_NOT_FOUND',
})

export const createTooManyRequestsError = (message: string = 'Demasiadas solicitudes'): AuthError => ({
  type: 'TOO_MANY_REQUESTS',
  message,
  code: 'TOO_MANY_REQUESTS',
})

export const createUserDisabledError = (message: string = 'El usuario está deshabilitado'): AuthError => ({
  type: 'USER_DISABLED',
  message,
  code: 'USER_DISABLED',
})

export const createOperationNotAllowedError = (message: string = 'Operación no permitida'): AuthError => ({
  type: 'OPERATION_NOT_ALLOWED',
  message,
  code: 'OPERATION_NOT_ALLOWED',
})

export const createInvalidEmailError = (message: string = 'El email no es válido'): AuthError => ({
  type: 'INVALID_EMAIL',
  message,
  code: 'INVALID_EMAIL',
})

export const createUnknownAuthError = (message: string = 'Error desconocido al iniciar sesión'): AuthError => ({
  type: 'UNKNOWN',
  message,
  code: 'UNKNOWN',
})

// Type guards (optional, for type narrowing)
export const isInvalidCredentialsError = (
  error: AuthError
): error is Extract<AuthError, { type: 'INVALID_CREDENTIALS' }> => {
  return error.type === 'INVALID_CREDENTIALS'
}

export const isUserNotFoundError = (
  error: AuthError
): error is Extract<AuthError, { type: 'USER_NOT_FOUND' }> => {
  return error.type === 'USER_NOT_FOUND'
}

export const isTooManyRequestsError = (
  error: AuthError
): error is Extract<AuthError, { type: 'TOO_MANY_REQUESTS' }> => {
  return error.type === 'TOO_MANY_REQUESTS'
}

export const isUserDisabledError = (
  error: AuthError
): error is Extract<AuthError, { type: 'USER_DISABLED' }> => {
  return error.type === 'USER_DISABLED'
}

export const isOperationNotAllowedError = (
  error: AuthError
): error is Extract<AuthError, { type: 'OPERATION_NOT_ALLOWED' }> => {
  return error.type === 'OPERATION_NOT_ALLOWED'
}

export const isInvalidEmailError = (
  error: AuthError
): error is Extract<AuthError, { type: 'INVALID_EMAIL' }> => {
  return error.type === 'INVALID_EMAIL'
}

export const isUnknownAuthError = (
  error: AuthError
): error is Extract<AuthError, { type: 'UNKNOWN' }> => {
  return error.type === 'UNKNOWN'
}
