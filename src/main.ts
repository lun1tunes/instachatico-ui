import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useLocaleStore } from './stores/locale'
import './style.css'
import { vuetify } from './plugins/vuetify'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(vuetify)

useLocaleStore()

// Initialize auth store to restore session and set API token
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
