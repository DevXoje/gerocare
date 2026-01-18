/**
 * Initialize Service Worker for asset caching (production only)
 * This function registers the service worker and handles updates
 */

function handleWorkerStateChange(worker: ServiceWorker) {
	if (worker.state === 'installed' && navigator.serviceWorker.controller) {
		// New service worker available, prompt user to reload
		console.log('New service worker available. Reload to update.')
	}
}

function handleServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
	registration.addEventListener('updatefound', () => {
		const newWorker = registration.installing
		if (!newWorker) return

		newWorker.addEventListener('statechange', () => {
			handleWorkerStateChange(newWorker)
		})
	})
}

export function initServiceWorker() {
	if (typeof window === 'undefined') return
	if (!('serviceWorker' in navigator)) return
	if (!import.meta.env.PROD) return

	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then(registration => {
				console.log('Service Worker registered:', registration.scope)
				handleServiceWorkerUpdate(registration)
			})
			.catch(error => {
				console.warn('Service Worker registration failed:', error)
			})
	})
}
