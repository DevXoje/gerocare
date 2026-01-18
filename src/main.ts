import { initTheme } from './shared/theme/initTheme'

import './assets/main.css'
import './assets/layouts.css'

// Initialize theme before app mount to prevent FOUC
initTheme()

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'

import { app as firebaseApp } from './infrastructure/firebase/firebase.config'
import App from './App.vue'
import router from './router'
// Import auth to ensure emulator connection is initialized
//import './infrastructure/firebase/firebase.config'

const app = createApp(App)

app.use(createPinia())
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()]
})
app.use(router)

app.mount('#app')
