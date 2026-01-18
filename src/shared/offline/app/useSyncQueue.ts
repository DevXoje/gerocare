import { ref, watch } from 'vue'

import type { OfflineOperation } from '@/shared/offline/domain/OfflineOperation'
import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'

/**
 * Repository map for sync operations
 * Maps entity names to their repository instances
 */
export type RepositoryMap = Record<string, {
	create?(data: unknown): Promise<{ success: boolean; value?: unknown; error?: unknown }>
	update?(id: string, updates: unknown): Promise<{ success: boolean; value?: unknown; error?: unknown }>
	delete?(id: string): Promise<{ success: boolean; value?: unknown; error?: unknown }>
}>

/**
 * Composable to sync offline queue with repositories
 * Processes queued operations when network is available
 */
export function useSyncQueue(queue: OfflineQueueRepository, repositories: RepositoryMap) {
	const isSyncing = ref(false)
	const pendingOperations = ref(0)
	const failedOperations = ref(0)

	/**
	 * Process a single operation from the queue
	 */
	async function processOperation(operation: OfflineOperation): Promise<boolean> {
		const repository = repositories[operation.entity]

		if (!repository) {
			console.warn(`No repository found for entity: ${operation.entity}`)
			return false
		}

		try {
			let result: { success: boolean; value?: unknown; error?: unknown }

			if (operation.type === 'create' && repository.create) {
				result = await repository.create(operation.data)
			} else if (operation.type === 'update' && repository.update) {
				const { id, updates } = operation.data as { id: string; updates: unknown }
				result = await repository.update(id, updates)
			} else if (operation.type === 'delete' && repository.delete) {
				const { id } = operation.data as { id: string }
				result = await repository.delete(id)
			} else {
				console.warn(`Unsupported operation type: ${operation.type} for entity: ${operation.entity}`)
				return false
			}

			if (result.success) {
				// Remove from queue on success
				await queue.remove(operation.id)
				return true
			} else {
				// Increment retries on failure
				await queue.incrementRetries(operation.id)
				return false
			}
		} catch (error) {
			console.error('Error processing operation:', error)
			await queue.incrementRetries(operation.id)
			return false
		}
	}

	/**
	 * Sync all pending operations
	 */
	async function sync(): Promise<void> {
		if (isSyncing.value || !navigator.onLine) {
			return
		}

		isSyncing.value = true

		try {
			const queueResult = await queue.getAll()

			if (!queueResult.success) {
				return
			}

			const operations = queueResult.value
			pendingOperations.value = operations.length

			// Process operations sequentially
			for (const operation of operations) {
				const success = await processOperation(operation)

				if (!success) {
					failedOperations.value += 1
				}

				pendingOperations.value -= 1
			}
		} catch (error) {
			console.error('Error syncing queue:', error)
		} finally {
			isSyncing.value = false
		}
	}

	/**
	 * Watch for network online events and auto-sync
	 */
	watch(
		() => navigator.onLine,
		(isOnline) => {
			if (isOnline) {
				sync()
			}
		},
		{ immediate: false }
	)

	/**
	 * Listen to custom network-online event
	 */
	if (typeof window !== 'undefined') {
		const handleOnline = () => {
			sync()
		}

		window.addEventListener('network-online', handleOnline)
	}

	return {
		isSyncing,
		pendingOperations,
		failedOperations,
		sync,
	}
}
