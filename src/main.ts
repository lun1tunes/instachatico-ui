import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useLocaleStore } from './stores/locale'
import { apiService } from './services/api'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

useLocaleStore()

// Initialize auth store to restore session and set API token
const authStore = useAuthStore()
authStore.initialize()

apiService.setTokenExpiredHandler((error) => {
  const reason =
    error?.message && error.message !== 'Token expired'
      ? `${error.message}. Please log in again.`
      : 'Session expired. Please log in again.'
  authStore.logout(reason)
})

watch(
  () => authStore.isAuthenticated,
  (isAuthed) => {
    if (!isAuthed && router.currentRoute.value.name !== 'Login') {
      router.replace({ name: 'Login' }).catch(() => {
        /* ignore redundant navigation errors */
      })
    }
  },
  { immediate: true }
)

app.mount('#app')
