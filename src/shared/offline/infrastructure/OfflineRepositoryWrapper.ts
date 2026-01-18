import type { Result } from '@/shared/domain/Result'
import { Ok } from '@/shared/domain/Result'
import { createOfflineOperation } from '@/shared/offline/domain/OfflineOperation'
import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'

/**
 * Wraps a repository with offline support.
 * When offline, write operations (create, update, delete) are queued.
 * When online, operations execute normally.
 *
 * @param repository - The repository to wrap
 * @param entityName - Name of the entity (e.g., 'resident', 'activity-log')
 * @param queue - The offline queue repository
 * @returns Wrapped repository with offline support
 */
export function withOfflineSupport<TRepository extends Record<string, (...args: unknown[]) => Promise<unknown>>>(
	repository: TRepository,
	entityName: string,
	queue: OfflineQueueRepository
): TRepository {
	const wrapped = { ...repository } as TRepository

	// Wrap create method
	if (typeof (wrapped as Record<string, unknown>).create === 'function') {
		const originalCreate = (repository as Record<string, (...args: unknown[]) => Promise<unknown>>).create.bind(repository) as (...args: unknown[]) => Promise<Result<unknown, unknown>>

		;(wrapped as Record<string, unknown>).create = async (...args: unknown[]) => {
			if (!navigator.onLine) {
				// Queue the operation
				const operation = createOfflineOperation('create', entityName, args[0])
				await queue.add(operation)

				// Return optimistic result
				const data = args[0] as Record<string, unknown>
				return Ok({
					...data,
					id: `offline-${Date.now()}`,
				}) as unknown as Result<unknown, unknown>
			}

			// Online: execute normally
			return originalCreate(...args)
		}
	}

	// Wrap update method
	if (typeof (wrapped as Record<string, unknown>).update === 'function') {
		const originalUpdate = (repository as Record<string, (...args: unknown[]) => Promise<unknown>>).update.bind(repository) as (...args: unknown[]) => Promise<Result<unknown, unknown>>

		;(wrapped as Record<string, unknown>).update = async (...args: unknown[]) => {
			if (!navigator.onLine) {
				// Queue the operation
				const operation = createOfflineOperation('update', entityName, {
					id: args[0],
					updates: args[1],
				})
				await queue.add(operation)

				// Return optimistic result
				const [id, updates] = args
				const updatesObj = updates as Record<string, unknown>
				return Ok({
					id,
					...(updatesObj || {}),
				}) as unknown as Result<unknown, unknown>
			}

			// Online: execute normally
			return originalUpdate(...args)
		}
	}

	// Wrap delete method
	if (typeof (wrapped as Record<string, unknown>).delete === 'function') {
		const originalDelete = (repository as Record<string, (...args: unknown[]) => Promise<unknown>>).delete.bind(repository) as (...args: unknown[]) => Promise<Result<unknown, unknown>>

		;(wrapped as Record<string, unknown>).delete = async (...args: unknown[]) => {
			if (!navigator.onLine) {
				// Queue the operation
				const operation = createOfflineOperation('delete', entityName, {
					id: args[0],
				})
				await queue.add(operation)

				// Return optimistic result
				return Ok(undefined) as unknown as Result<unknown, unknown>
			}

			// Online: execute normally
			return originalDelete(...args)
		}
	}

	// Read-only methods (findById, findAll, etc.) are not wrapped
	// They will use Firestore's persistent cache when offline

	return wrapped
}
