import type { AppError } from '@/shared/domain/AppError'
import { createAppError } from '@/shared/domain/AppError'

export type AuthError = AppError & {
	authErrorType: AuthErrorType
}

export type AuthErrorType =
	| 'INVALID_CREDENTIALS'
	| 'USER_NOT_FOUND'
	| 'TOO_MANY_REQUESTS'
	| 'USER_DISABLED'
	| 'OPERATION_NOT_ALLOWED'
	| 'INVALID_EMAIL'
	| 'EMAIL_ALREADY_IN_USE'
	| 'WEAK_PASSWORD'
	| 'UNKNOWN'

// Factory functions
export const createInvalidCredentialsError = (
	message: string = 'Credenciales inválidas'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'INVALID_CREDENTIALS' }),
	authErrorType: 'INVALID_CREDENTIALS',
})

export const createUserNotFoundError = (message: string = 'Usuario no encontrado'): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'USER_NOT_FOUND' }),
	authErrorType: 'USER_NOT_FOUND',
})

export const createTooManyRequestsError = (
	message: string = 'Demasiadas solicitudes'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'TOO_MANY_REQUESTS' }),
	authErrorType: 'TOO_MANY_REQUESTS',
})

export const createUserDisabledError = (
	message: string = 'El usuario está deshabilitado'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'USER_DISABLED' }),
	authErrorType: 'USER_DISABLED',
})

export const createOperationNotAllowedError = (
	message: string = 'Operación no permitida'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'OPERATION_NOT_ALLOWED' }),
	authErrorType: 'OPERATION_NOT_ALLOWED',
})

export const createInvalidEmailError = (message: string = 'El email no es válido'): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'INVALID_EMAIL' }),
	authErrorType: 'INVALID_EMAIL',
})

export const createEmailAlreadyInUseError = (
	message: string = 'El email ya está en uso'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'EMAIL_ALREADY_IN_USE' }),
	authErrorType: 'EMAIL_ALREADY_IN_USE',
})

export const createWeakPasswordError = (
	message: string = 'La contraseña es demasiado débil'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'WEAK_PASSWORD' }),
	authErrorType: 'WEAK_PASSWORD',
})

export const createUnknownAuthError = (
	message: string = 'Error desconocido al iniciar sesión'
): AuthError => ({
	...createAppError('AUTH_ERROR', message, { authErrorType: 'UNKNOWN' }),
	authErrorType: 'UNKNOWN',
})

// Type guards (for type narrowing)
export const isInvalidCredentialsError = (error: AuthError): boolean => {
	return error.authErrorType === 'INVALID_CREDENTIALS'
}

export const isUserNotFoundError = (error: AuthError): boolean => {
	return error.authErrorType === 'USER_NOT_FOUND'
}

export const isTooManyRequestsError = (error: AuthError): boolean => {
	return error.authErrorType === 'TOO_MANY_REQUESTS'
}

export const isUserDisabledError = (error: AuthError): boolean => {
	return error.authErrorType === 'USER_DISABLED'
}

export const isOperationNotAllowedError = (error: AuthError): boolean => {
	return error.authErrorType === 'OPERATION_NOT_ALLOWED'
}

export const isInvalidEmailError = (error: AuthError): boolean => {
	return error.authErrorType === 'INVALID_EMAIL'
}

export const isEmailAlreadyInUseError = (error: AuthError): boolean => {
	return error.authErrorType === 'EMAIL_ALREADY_IN_USE'
}

export const isWeakPasswordError = (error: AuthError): boolean => {
	return error.authErrorType === 'WEAK_PASSWORD'
}

export const isUnknownAuthError = (error: AuthError): boolean => {
	return error.authErrorType === 'UNKNOWN'
}
