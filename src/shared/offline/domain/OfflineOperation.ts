/**
 * Type of operation that can be queued offline
 */
export type OfflineOperationType = 'create' | 'update' | 'delete'

/**
 * Represents an operation that is queued for execution when online
 */
export interface OfflineOperation {
	/**
	 * Unique identifier for this operation
	 */
	id: string
	/**
	 * Type of operation
	 */
	type: OfflineOperationType
	/**
	 * Name of the entity (e.g., 'resident', 'activity-log')
	 */
	entity: string
	/**
	 * Data associated with the operation
	 */
	data: unknown
	/**
	 * Timestamp when the operation was created
	 */
	timestamp: Date
	/**
	 * Number of times this operation has been retried
	 */
	retries: number
}

/**
 * Create a new offline operation
 */
export function createOfflineOperation(
	type: OfflineOperationType,
	entity: string,
	data: unknown
): OfflineOperation {
	return {
		id: `${type}-${entity}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		type,
		entity,
		data,
		timestamp: new Date(),
		retries: 0,
	}
}

/**
 * Increment the retry count for an operation
 * Returns a new operation instance (immutable)
 */
export function incrementRetries(operation: OfflineOperation): OfflineOperation {
	return {
		...operation,
		retries: operation.retries + 1,
	}
}

/**
 * Check if an operation has expired based on its timestamp
 * @param operation The operation to check
 * @param maxAgeMs Maximum age in milliseconds before expiration
 */
export function isExpired(operation: OfflineOperation, maxAgeMs: number): boolean {
	const age = Date.now() - operation.timestamp.getTime()
	return age > maxAgeMs
}
