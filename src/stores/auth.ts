import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiService } from '@/services/api'

interface User {
  username: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  base_url: string | null
  scopes?: string[]
}

interface StoredAuth {
  username: string
  accessToken: string
  tokenType: string
  baseUrl: string | null
  scopes: string[]
}

const STORAGE_KEY = 'instachatico_auth'
const DEFAULT_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
const TOKEN_ENDPOINT = (() => {
  const raw = (import.meta.env.VITE_AUTH_TOKEN_URL as string | undefined) ?? ''
  const trimmed = raw.trim()

  if (!trimmed) {
    return 'http://localhost:8100/token'
  }

  if (isAbsoluteUrl(trimmed)) {
    return trimmed.replace(/\/+$/, '')
  }

  const base = normalizeBaseUrl(DEFAULT_BASE_URL) || '/api'
  const path = normalizePath(trimmed || '/token') || '/token'
  return `${base}${path}`
})()

function normalizeBaseUrl(baseUrl: string | null): string | null {
  if (!baseUrl) return null
  return baseUrl.replace(/\/+$/, '')
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function isLoopbackHost(hostname: string | null): boolean {
  if (!hostname) return false
  const lower = hostname.toLowerCase()
  return lower === 'localhost' || lower === '127.0.0.1' || lower === '::1'
}

function normalizePath(value: string): string {
  if (!value) return ''
  const trimmed = value.replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const DEFAULT_API_PATH = normalizePath(
  isAbsoluteUrl(DEFAULT_BASE_URL) ? new URL(DEFAULT_BASE_URL).pathname : DEFAULT_BASE_URL
)

function mergePath(basePath: string, defaultPath: string): string {
  const base = normalizePath(basePath)
  const fallback = normalizePath(defaultPath)

  if (!fallback) return base || ''
  if (!base || base === '/') return fallback
  if (base === fallback || base.endsWith(fallback)) return base
  if (fallback.startsWith(base)) {
    const remainder = fallback.slice(base.length)
    if (!remainder || remainder.startsWith('/')) {
      return fallback
    }
  }
  return base
}

function resolveApiBaseUrl(authBaseUrl: string | null): string {
  const normalized = normalizeBaseUrl(authBaseUrl)
  if (!normalized) return DEFAULT_BASE_URL

  if (!isAbsoluteUrl(normalized)) {
    const relative = normalizePath(normalized)
    return relative || DEFAULT_BASE_URL || '/'
  }

  try {
    const url = new URL(normalized)
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname
      const baseIsLoopback = isLoopbackHost(url.hostname)
      const currentIsLoopback = isLoopbackHost(currentHost)

      if (baseIsLoopback && !currentIsLoopback) {
        return DEFAULT_BASE_URL
      }
    }

    if (DEFAULT_API_PATH) {
      const merged = mergePath(url.pathname, DEFAULT_API_PATH)
      url.pathname = merged || '/'
    }
    return url.toString().replace(/\/+$/, '')
  } catch (_error) {
    return normalized
  }
}

function parseAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as any)?.detail
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === 'string') {
      return detail[0].msg
    }
    return error.response?.status === 401 ? 'Invalid username or password' : 'Authentication failed'
  }
  return 'Authentication failed'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const tokenType = ref<string | null>(null)
  const baseUrl = ref<string | null>(null)
  const scopes = ref<string[]>([])
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function persist() {
    if (!accessToken.value) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const payload: StoredAuth = {
      username: user.value?.username ?? '',
      accessToken: accessToken.value,
      tokenType: tokenType.value ?? 'bearer',
      baseUrl: baseUrl.value,
      scopes: scopes.value
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  function applySession({ username, accessToken: token, tokenType: type, baseUrl: apiBase, scopes: scopeList }: StoredAuth) {
    user.value = username ? { username } : null
    accessToken.value = token
    tokenType.value = type
    baseUrl.value = apiBase
    scopes.value = scopeList

    apiService.setAuthToken(token, type)
    const resolvedBase = resolveApiBaseUrl(apiBase)
    apiService.setBaseUrl(resolvedBase)

    // Update runtime env reference so other modules reading VITE_API_BASE_URL
    // after authentication see the backend-provided value.
    try {
      ;(import.meta as any).env.VITE_API_BASE_URL = resolvedBase
    } catch (_error) {
      // ignore when running in environments that prevent reassignment
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    error.value = null

    try {
      const body = new URLSearchParams()
      body.append('username', username)
      body.append('password', password)

      const response = await axios.post<AuthResponse>(TOKEN_ENDPOINT, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const data = response.data
      const stored: StoredAuth = {
        username,
        accessToken: data.access_token,
        tokenType: data.token_type ?? 'bearer',
        baseUrl: normalizeBaseUrl(data.base_url),
        scopes: data.scopes ?? []
      }

      applySession(stored)
      persist()
      return true
    } catch (err) {
      logout()
      error.value = parseAuthError(err)
      return false
    }
  }

  function logout(reason?: string) {
    user.value = null
    accessToken.value = null
    tokenType.value = null
    baseUrl.value = null
    scopes.value = []
    error.value = reason ?? null

    localStorage.removeItem(STORAGE_KEY)
    apiService.setAuthToken('')
    apiService.setBaseUrl(DEFAULT_BASE_URL)
    try {
      ;(import.meta as any).env.VITE_API_BASE_URL = DEFAULT_BASE_URL
    } catch (_error) {
      // ignore when running in environments that prevent reassignment
    }
  }

  function initialize() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      apiService.setBaseUrl(DEFAULT_BASE_URL)
      try {
        ;(import.meta as any).env.VITE_API_BASE_URL = DEFAULT_BASE_URL
      } catch (_error) {
        // ignore when running in environments that prevent reassignment
      }
      return
    }

    try {
      const stored = JSON.parse(raw) as StoredAuth
      if (stored.accessToken) {
        applySession(stored)
      } else {
        localStorage.removeItem(STORAGE_KEY)
        apiService.setBaseUrl(DEFAULT_BASE_URL)
        try {
          ;(import.meta as any).env.VITE_API_BASE_URL = DEFAULT_BASE_URL
        } catch (_error) {
          // ignore when running in environments that prevent reassignment
        }
      }
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY)
      apiService.setBaseUrl(DEFAULT_BASE_URL)
      try {
        ;(import.meta as any).env.VITE_API_BASE_URL = DEFAULT_BASE_URL
      } catch (_error) {
        // ignore when running in environments that prevent reassignment
      }
    }
  }

  return {
    user,
    accessToken,
    tokenType,
    baseUrl,
    scopes,
    error,
    isAuthenticated,
    login,
    logout,
    initialize
  }
})
