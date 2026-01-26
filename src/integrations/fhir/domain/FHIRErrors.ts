export interface FHIRError {
	code: string
	message: string
	details?: unknown
}

export function createFHIRNotFoundError(
	resourceType: string,
	id: string,
	message?: string
): FHIRError {
	return {
		code: 'FHIR_NOT_FOUND',
		message: message || `${resourceType}/${id} not found`,
		details: { resourceType, id },
	}
}

export function createFHIRValidationError(message: string, details?: unknown): FHIRError {
	return {
		code: 'FHIR_VALIDATION_ERROR',
		message,
		details,
	}
}

export function createFHIRSearchError(message: string, details?: unknown): FHIRError {
	return {
		code: 'FHIR_SEARCH_ERROR',
		message,
		details,
	}
}

export function createUnknownFHIRError(message: string = 'Unknown FHIR error'): FHIRError {
	return {
		code: 'UNKNOWN_FHIR_ERROR',
		message,
	}
}
