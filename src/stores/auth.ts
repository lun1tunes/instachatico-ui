import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const isAuthenticated = ref<boolean>(false)

  function setToken(newToken: string) {
    token.value = newToken
    isAuthenticated.value = !!newToken
    apiService.setAuthToken(newToken)

    // Save to localStorage
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  function loadToken() {
    const savedToken = localStorage.getItem('auth_token') || import.meta.env.VITE_BEARER_TOKEN
    if (savedToken) {
      setToken(savedToken)
    }
  }

  function logout() {
    setToken('')
  }

  return {
    token,
    isAuthenticated,
    setToken,
    loadToken,
    logout
  }
})
