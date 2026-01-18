/**
 * Service Worker for GeroCare
 * Handles caching of static assets for offline support
 */

const CACHE_NAME = 'gerocare-v1'
const STATIC_ASSETS = [
	'/',
	'/index.html',
]

// Install: Cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS).catch((error) => {
				console.warn('Failed to cache some static assets:', error)
			})
		})
	)
	// Force activate new service worker
	self.skipWaiting()
})

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			)
		})
	)
	// Take control of all clients immediately
	return self.clients.claim()
})

// Fetch: Handle requests with cache-first strategy for assets, network-first for data
self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)

	// Skip cross-origin requests
	if (url.origin !== location.origin) {
		return
	}

	// Cache-first strategy for static assets (JS, CSS, images)
	if (
		request.destination === 'script' ||
		request.destination === 'style' ||
		request.destination === 'image' ||
		request.destination === 'font'
	) {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse
				}

				return fetch(request).then((response) => {
					// Don't cache non-successful responses
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response
					}

					const responseToCache = response.clone()

					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseToCache)
					})

					return response
				})
			})
		)
		return
	}

	// Network-first strategy for API/data requests
	// Firestore handles its own persistence, so we let it through
	if (url.pathname.includes('/__/') || url.pathname.includes('firestore.googleapis.com')) {
		// Firestore requests - let them through (Firestore handles its own offline support)
		return
	}

	// For other requests, try network first, fallback to cache
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Cache successful responses
				if (response && response.status === 200) {
					const responseToCache = response.clone()
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseToCache)
					})
				}
				return response
			})
			.catch(() => {
				// Fallback to cache if network fails
				return caches.match(request)
			})
	)
})
