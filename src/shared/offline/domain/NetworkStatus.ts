/**
 * Represents the current network connectivity status
 */
export interface NetworkStatus {
	/**
	 * Whether the device is currently online
	 */
	isOnline: boolean
	/**
	 * Timestamp of when the device was last online, or null if currently online
	 */
	lastOnlineAt: Date | null
}

/**
 * Create a new NetworkStatus instance
 */
export function createNetworkStatus(
	isOnline: boolean,
	lastOnlineAt: Date | null = null
): NetworkStatus {
	return {
		isOnline,
		lastOnlineAt,
	}
}
