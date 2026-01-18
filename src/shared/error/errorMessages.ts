import type { AppError } from '@/shared/domain/AppError'

/**
 * Get a user-friendly error message from an AppError
 * Maps error codes to friendly messages in Spanish
 */
export function getUserFriendlyMessage(error: AppError): string {
	// If the error already has a user-friendly message, use it
	// Otherwise, map the code to a friendly message
	const codeMessages: Record<string, string> = {
		VALIDATION_ERROR: 'Por favor, verifique los datos ingresados',
		NOT_FOUND: 'No se encontró el recurso solicitado',
		PERMISSION_ERROR: 'No tiene permisos para realizar esta acción',
		REPOSITORY_ERROR: 'Error al acceder a los datos. Por favor, intente nuevamente',
		NETWORK_ERROR: 'Error de conexión. Verifique su internet e intente nuevamente',
		AUTH_ERROR: 'Error de autenticación. Por favor, inicie sesión nuevamente',
		UNKNOWN_ERROR: 'Ha ocurrido un error inesperado. Por favor, intente nuevamente',
		CREATE_FAILED: 'Error al crear el recurso. Por favor, intente nuevamente',
		UPDATE_FAILED: 'Error al actualizar el recurso. Por favor, intente nuevamente',
		DELETE_FAILED: 'Error al eliminar el recurso. Por favor, intente nuevamente',
	}

	// Use the mapped message if available, otherwise use the error's message
	return codeMessages[error.code] || error.message
}
