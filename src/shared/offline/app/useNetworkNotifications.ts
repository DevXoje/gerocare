import { onMounted, onUnmounted } from 'vue'

import { useNotifications } from '@/shared/composables/useNotifications'
import { useNetworkStatus } from '@/shared/offline/app/useNetworkStatus'

/**
 * Composable that automatically shows notifications when network status changes
 * Should be initialized once in the root App component
 */
export function useNetworkNotifications() {
	const { wasOffline } = useNetworkStatus()
	const { warning, success } = useNotifications()

	function handleNetworkOffline() {
		warning('Estás trabajando sin conexión. Los cambios se sincronizarán automáticamente cuando se recupere la conexión.')
	}

	function handleNetworkOnline() {
		if (wasOffline.value) {
			success('Conexión recuperada. Sincronizando cambios...')
		}
	}

	onMounted(() => {
		window.addEventListener('network-offline', handleNetworkOffline)
		window.addEventListener('network-online', handleNetworkOnline)
	})

	onUnmounted(() => {
		window.removeEventListener('network-offline', handleNetworkOffline)
		window.removeEventListener('network-online', handleNetworkOnline)
	})
}
