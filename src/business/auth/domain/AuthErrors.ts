import type { I18nTranslationFunction } from '@/shared/i18n'
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
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.invalidCredentials') : 'Credenciales inválidas'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'INVALID_CREDENTIALS' }),
		authErrorType: 'INVALID_CREDENTIALS',
	}
}

export const createUserNotFoundError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.userNotFound') : 'Usuario no encontrado'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'USER_NOT_FOUND' }),
		authErrorType: 'USER_NOT_FOUND',
	}
}

export const createTooManyRequestsError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.tooManyRequests') : 'Demasiadas solicitudes'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'TOO_MANY_REQUESTS' }),
		authErrorType: 'TOO_MANY_REQUESTS',
	}
}

export const createUserDisabledError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.userDisabled') : 'El usuario está deshabilitado'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'USER_DISABLED' }),
		authErrorType: 'USER_DISABLED',
	}
}

export const createOperationNotAllowedError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.operationNotAllowed') : 'Operación no permitida'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, {
			authErrorType: 'OPERATION_NOT_ALLOWED',
		}),
		authErrorType: 'OPERATION_NOT_ALLOWED',
	}
}

export const createInvalidEmailError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.invalidEmail') : 'El email no es válido'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'INVALID_EMAIL' }),
		authErrorType: 'INVALID_EMAIL',
	}
}

export const createEmailAlreadyInUseError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.emailAlreadyInUse') : 'El email ya está en uso'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, {
			authErrorType: 'EMAIL_ALREADY_IN_USE',
		}),
		authErrorType: 'EMAIL_ALREADY_IN_USE',
	}
}

export const createWeakPasswordError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.weakPassword') : 'La contraseña es demasiado débil'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'WEAK_PASSWORD' }),
		authErrorType: 'WEAK_PASSWORD',
	}
}

export const createUnknownAuthError = (
	t?: I18nTranslationFunction,
	message?: string
): AuthError => {
	const defaultMsg = t ? t('auth.errors.unknown') : 'Error desconocido al iniciar sesión'
	return {
		...createAppError('AUTH_ERROR', message || defaultMsg, { authErrorType: 'UNKNOWN' }),
		authErrorType: 'UNKNOWN',
	}
}

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
