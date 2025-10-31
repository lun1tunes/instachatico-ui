import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useLocaleStore } from './stores/locale'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

useLocaleStore()

// Initialize auth store to restore session and set API token
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
