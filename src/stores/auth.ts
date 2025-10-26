import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '@/services/api'

interface User {
  username: string
}

// Simple in-memory credentials for UI access
// TODO: Move to environment variables or backend
const UI_CREDENTIALS = {
  username: import.meta.env.VITE_UI_USERNAME || 'admin',
  password: import.meta.env.VITE_UI_PASSWORD || 'admin123'
}

// Static API Bearer token (unchanged)
const API_BEARER_TOKEN = import.meta.env.VITE_BEARER_TOKEN || ''

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Check if user is logged into the UI
  function checkUIAuth(): boolean {
    const savedUser = localStorage.getItem('ui_user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true

      // Set API token (static bearer token for API requests)
      apiService.setAuthToken(API_BEARER_TOKEN)

      return true
    }
    return false
  }

  // Login to UI (username/password)
  function loginUI(username: string, password: string): boolean {
    error.value = null

    // Validate UI credentials
    if (username === UI_CREDENTIALS.username && password === UI_CREDENTIALS.password) {
      const userData: User = { username }

      // Save user to localStorage
      localStorage.setItem('ui_user', JSON.stringify(userData))
      user.value = userData
      isAuthenticated.value = true

      // Set static API bearer token for all API requests
      apiService.setAuthToken(API_BEARER_TOKEN)

      return true
    } else {
      error.value = 'Invalid username or password'
      return false
    }
  }

  // Logout from UI
  function logout() {
    localStorage.removeItem('ui_user')
    user.value = null
    isAuthenticated.value = false
    error.value = null
    apiService.setAuthToken('')
  }

  // Initialize on app load
  function initialize() {
    checkUIAuth()
  }

  return {
    user,
    isAuthenticated,
    error,
    loginUI,
    logout,
    initialize,
    checkUIAuth
  }
})
