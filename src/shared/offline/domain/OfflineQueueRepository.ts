import type { Result } from '@/shared/domain/Result'
import type { OfflineError } from '@/shared/offline/domain/OfflineErrors'
import type { OfflineOperation } from '@/shared/offline/domain/OfflineOperation'

/**
 * Repository interface for managing offline operation queue
 */
export interface OfflineQueueRepository {
	/**
	 * Add an operation to the queue
	 */
	add(operation: OfflineOperation): Promise<Result<void, OfflineError>>

	/**
	 * Get all operations in the queue
	 */
	getAll(): Promise<Result<OfflineOperation[], OfflineError>>

	/**
	 * Remove an operation from the queue by ID
	 */
	remove(id: string): Promise<Result<void, OfflineError>>

	/**
	 * Clear all operations from the queue
	 */
	clear(): Promise<Result<void, OfflineError>>

	/**
	 * Increment the retry count for an operation
	 */
	incrementRetries(id: string): Promise<Result<void, OfflineError>>
}
