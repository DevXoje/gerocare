import { createAppError } from '@/shared/domain/AppError'
import { Err, Ok, type Result } from '@/shared/domain/Result'
import type { OfflineError } from '@/shared/offline/domain/OfflineErrors'
import {
	createOfflineQueueFullError,
	createUnknownOfflineError,
} from '@/shared/offline/domain/OfflineErrors'
import type { OfflineOperation } from '@/shared/offline/domain/OfflineOperation'
import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'

const STORAGE_KEY = 'gerocare_offline_queue'

/**
 * Default maximum number of operations in the queue
 */
const DEFAULT_MAX_OPERATIONS = 100

/**
 * LocalStorage implementation of OfflineQueueRepository
 */
export class LocalStorageOfflineQueue implements OfflineQueueRepository {
	private readonly maxOperations: number

	constructor(maxOperations: number = DEFAULT_MAX_OPERATIONS) {
		this.maxOperations = maxOperations
	}

	async add(operation: OfflineOperation): Promise<Result<void, OfflineError>> {
		try {
			const allResult = await this.getAll()

			if (!allResult.success) {
				return allResult
			}

			const operations = allResult.value

			if (operations.length >= this.maxOperations) {
				return Err(createOfflineQueueFullError())
			}

			operations.push(operation)
			this.saveToStorage(operations)

			return Ok(undefined)
		} catch {
			return Err(createUnknownOfflineError('Failed to add operation to queue'))
		}
	}

	async getAll(): Promise<Result<OfflineOperation[], OfflineError>> {
		try {
			const stored = localStorage.getItem(STORAGE_KEY)

			if (!stored) {
				return Ok([])
			}

			const parsed = JSON.parse(stored) as Array<
				Omit<OfflineOperation, 'timestamp'> & { timestamp: string }
			>

			// Convert timestamp strings back to Date objects
			const operations: OfflineOperation[] = parsed.map(op => ({
				...op,
				timestamp: new Date(op.timestamp),
			}))

			return Ok(operations)
		} catch {
			// If data is corrupted, clear it and return empty array
			localStorage.removeItem(STORAGE_KEY)
			return Ok([])
		}
	}

	async remove(id: string): Promise<Result<void, OfflineError>> {
		try {
			const allResult = await this.getAll()

			if (!allResult.success) {
				return allResult
			}

			const operations = allResult.value.filter(op => op.id !== id)
			this.saveToStorage(operations)

			return Ok(undefined)
		} catch {
			return Err(createUnknownOfflineError('Failed to remove operation from queue'))
		}
	}

	async clear(): Promise<Result<void, OfflineError>> {
		try {
			localStorage.removeItem(STORAGE_KEY)
			return Ok(undefined)
		} catch {
			return Err(createUnknownOfflineError('Failed to clear queue'))
		}
	}

	async incrementRetries(id: string): Promise<Result<void, OfflineError>> {
		try {
			const allResult = await this.getAll()

			if (!allResult.success) {
				return allResult
			}

			const operations = allResult.value
			const operation = operations.find(op => op.id === id)

			if (!operation) {
				return Err(createAppError('NOT_FOUND', `Operation with id ${id} not found`))
			}

			operation.retries += 1
			this.saveToStorage(operations)

			return Ok(undefined)
		} catch {
			return Err(createUnknownOfflineError('Failed to increment retries'))
		}
	}

	private saveToStorage(operations: OfflineOperation[]): void {
		const serialized = JSON.stringify(operations)
		localStorage.setItem(STORAGE_KEY, serialized)
	}
}
