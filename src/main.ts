import { initServiceWorker } from '@/shared/service-worker/initServiceWorker'
import { initTheme } from '@/shared/theme/initTheme'

import '@/assets/main.css'
import '@/assets/layouts.css'

// Initialize theme before app mount to prevent FOUC
initTheme()

// Register Service Worker for asset caching (production only)
initServiceWorker()

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'

import App from '@/App.vue'
import { app as firebaseApp } from '@/infrastructure/firebase/firebase.config'
import router from '@/router'
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
