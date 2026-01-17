import './assets/main.css'
import './assets/layouts.css'

import { initTheme } from './shared/theme/initTheme'

// Initialize theme before app mount to prevent FOUC
initTheme()

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'

import App from './App.vue'
import router from './router'
import { app as firebaseApp } from './infrastructure/firebase/firebase.config'
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
