import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Composable to track network connectivity status
 * Provides reactive state and emits custom events for network changes
 */
export function useNetworkStatus() {
	const isOnline = ref(navigator.onLine)
	const wasOffline = ref(false)

	function updateNetworkStatus() {
		const previousStatus = isOnline.value
		isOnline.value = navigator.onLine

		if (!previousStatus && isOnline.value) {
			// Transitioned from offline to online
			wasOffline.value = true
			window.dispatchEvent(new CustomEvent('network-online'))
		} else if (previousStatus && !isOnline.value) {
			// Transitioned from online to offline
			window.dispatchEvent(new CustomEvent('network-offline'))
		}
	}

	onMounted(() => {
		window.addEventListener('online', updateNetworkStatus)
		window.addEventListener('offline', updateNetworkStatus)
	})

	onUnmounted(() => {
		window.removeEventListener('online', updateNetworkStatus)
		window.removeEventListener('offline', updateNetworkStatus)
	})

	return {
		isOnline,
		wasOffline,
	}
}
