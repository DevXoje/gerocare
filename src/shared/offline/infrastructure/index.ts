import type { OfflineQueueRepository } from '@/shared/offline/domain/OfflineQueueRepository'
import { LocalStorageOfflineQueue } from '@/shared/offline/infrastructure/LocalStorageOfflineQueue'

/**
 * Singleton instance of the offline queue repository
 */
let repositoryInstance: OfflineQueueRepository | null = null

/**
 * Create or get the singleton instance of OfflineQueueRepository
 */
export function createOfflineQueueRepository(): OfflineQueueRepository {
	if (!repositoryInstance) {
		repositoryInstance = new LocalStorageOfflineQueue()
	}
	return repositoryInstance
}
