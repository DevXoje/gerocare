import { initTheme } from '@/shared/theme/initTheme'

import '@/assets/main.css'
import '@/assets/layouts.css'

// Initialize theme before app mount to prevent FOUC
initTheme()

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'

import App from '@/App.vue'
import { app as firebaseApp } from '@/infrastructure/firebase/firebase.config'
import router from '@/router'

// Register Service Worker for asset caching (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then((registration) => {
				console.log('Service Worker registered:', registration.scope)

				// Check for updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing
					if (newWorker) {
						newWorker.addEventListener('statechange', () => {
							if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
								// New service worker available, prompt user to reload
								console.log('New service worker available. Reload to update.')
							}
						})
					}
				})
			})
			.catch((error) => {
				console.warn('Service Worker registration failed:', error)
			})
	})
}
import { setupGlobalErrorHandling } from '@/shared/error/errorHandler'
// Import auth to ensure emulator connection is initialized
//import './infrastructure/firebase/firebase.config'

const app = createApp(App)

// Setup global error handling before mounting
setupGlobalErrorHandling(app)

app.use(createPinia())
app.use(VueFire, {
	firebaseApp,
	modules: [VueFireAuth()],
})
app.use(router)

app.mount('#app')
