import { describe, expect, it } from 'vitest'

import { createNetworkStatus, type NetworkStatus } from '@/shared/offline/domain/NetworkStatus'

describe('NetworkStatus', () => {
	describe('createNetworkStatus', () => {
		it('should create a NetworkStatus with initial online state', () => {
			const status = createNetworkStatus(true)

			expect(status.isOnline).toBe(true)
			expect(status.lastOnlineAt).toBeNull()
		})

		it('should create a NetworkStatus with offline state', () => {
			const status = createNetworkStatus(false)

			expect(status.isOnline).toBe(false)
			expect(status.lastOnlineAt).toBeNull()
		})

		it('should create a NetworkStatus with lastOnlineAt timestamp', () => {
			const lastOnlineAt = new Date('2024-01-01T12:00:00Z')
			const status = createNetworkStatus(false, lastOnlineAt)

			expect(status.isOnline).toBe(false)
			expect(status.lastOnlineAt).toEqual(lastOnlineAt)
		})
	})

	describe('NetworkStatus transitions', () => {
		it('should transition from online to offline', () => {
			const onlineStatus = createNetworkStatus(true)
			expect(onlineStatus.isOnline).toBe(true)

			const offlineStatus = createNetworkStatus(false)
			expect(offlineStatus.isOnline).toBe(false)
		})

		it('should track lastOnlineAt when going offline', () => {
			const now = new Date()
			const status = createNetworkStatus(false, now)

			expect(status.lastOnlineAt).toEqual(now)
		})
	})

	describe('NetworkStatus type', () => {
		it('should have correct type structure', () => {
			const status: NetworkStatus = createNetworkStatus(true)

			expect(status).toHaveProperty('isOnline')
			expect(status).toHaveProperty('lastOnlineAt')
			expect(typeof status.isOnline).toBe('boolean')
			expect(status.lastOnlineAt === null || status.lastOnlineAt instanceof Date).toBe(true)
		})
	})
})
