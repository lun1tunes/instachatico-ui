<template>
  <div class="youtube-auth-page">
    <div class="container">
      <div class="page-header">
        <p class="eyebrow">{{ localeStore.t('youtubeAuth.eyebrow') }}</p>
        <h1>{{ localeStore.t('youtubeAuth.title') }}</h1>
        <p class="subtitle">{{ localeStore.t('youtubeAuth.subtitle') }}</p>
      </div>

      <BaseCard class="auth-card">
        <div v-if="isConnected" class="status status--success">
          <strong>{{ localeStore.t('youtubeAuth.connectedStatus', { channel: connectedChannelLabel ?? 'YouTube' }) }}</strong>
        </div>
        <div v-else-if="statusMessage" class="status status--info">
          {{ statusMessage }}
        </div>
        <div v-if="errorMessage" class="status status--error">
          <div class="status__row">
            <span>{{ errorMessage }}</span>
            <BaseButton size="sm" variant="ghost" @click="startAuthorization">
              {{ localeStore.t('youtubeAuth.retry') }}
            </BaseButton>
          </div>
          <p class="hint muted">{{ localeStore.t('youtubeAuth.rerunConsent') }}</p>
        </div>

        <div class="auth-grid">
          <div class="panel">
            <h3>{{ localeStore.t('youtubeAuth.scopeTitle') }}</h3>
            <p class="scope">{{ requiredScope }}</p>
            <p class="redirect">
              <span class="label">{{ localeStore.t('youtubeAuth.redirectLabel') }}</span>
              <span class="value">{{ redirectUri }}</span>
            </p>
            <p class="hint">{{ localeStore.t('youtubeAuth.redirectNote') }}</p>
          </div>

          <div class="panel panel--action">
            <h3>{{ localeStore.t('youtubeAuth.connectHeading') }}</h3>
            <p class="hint">{{ localeStore.t('youtubeAuth.connectCopy') }}</p>

            <div class="actions">
              <BaseButton
                :loading="authorizeLoading"
                :disabled="exchangeLoading || isConnected"
                @click="startAuthorization"
              >
                {{ isConnected ? localeStore.t('youtubeAuth.connectedCta') : localeStore.t('youtubeAuth.cta') }}
              </BaseButton>
              <p class="hint muted">{{ localeStore.t('youtubeAuth.consentHint') }}</p>
            </div>

            <div v-if="exchangeLoading" class="inline-loader">
              <LoadingSpinner :message="localeStore.t('youtubeAuth.exchanging')" />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { apiService } from '@/services/api'
import { useLocaleStore } from '@/stores/locale'
import type { GoogleAuthCallbackResponse } from '@/types/api'

type StoredAuthSession = {
  state: string
  authUrl: string
  expiresAt: number
}

const STORAGE_KEY = 'youtube-auth-session'
const REQUIRED_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl'

const localeStore = useLocaleStore()
const route = useRoute()
const router = useRouter()

const authorizeLoading = ref(false)
const exchangeLoading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')
const isConnected = ref(false)
const connectedChannelLabel = ref<string | null>(null)

const storedSession = ref<StoredAuthSession | null>(loadStoredSession())

const redirectUri = computed(() => {
  const envValue = (import.meta as any)?.env?.VITE_YOUTUBE_REDIRECT_URI as string | undefined
  if (envValue && typeof envValue === 'string') {
    return envValue
  }

  if (typeof window === 'undefined') return 'http://localhost:5291/api/v1/auth/google/callback'
  try {
    return new URL('/api/v1/auth/google/callback', window.location.origin).toString()
  } catch (_error) {
    return 'http://localhost:5291/api/v1/auth/google/callback'
  }
})

const requiredScope = computed(() => REQUIRED_SCOPE)

function loadStoredSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuthSession
    if (!parsed?.state || !parsed?.authUrl || !parsed?.expiresAt) return null
    return parsed
  } catch (_error) {
    return null
  }
}

function persistSession(session: StoredAuthSession) {
  storedSession.value = session
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function clearSession() {
  storedSession.value = null
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

function clearQueryParams() {
  if (route.name) {
    router.replace({ name: route.name, query: {} })
  } else {
    router.replace({ path: route.path.split('?')[0], query: {} })
  }
}

function takeQueryParam(key: string): string | null {
  const value = route.query[key]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return typeof value === 'string' ? value : null
}

function parseError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return localeStore.t('youtubeAuth.genericError')
}

function isStateExpired(session: StoredAuthSession | null) {
  return !session || session.expiresAt <= Date.now()
}

async function startAuthorization() {
  errorMessage.value = ''
  statusMessage.value = ''
  authorizeLoading.value = true

  try {
    const response = await apiService.getGoogleAuthRequest()
    const expiresAt = Date.now() + 10 * 60 * 1000
    persistSession({
      state: response.state,
      authUrl: response.auth_url,
      expiresAt
    })
    window.location.href = response.auth_url
  } catch (error) {
    errorMessage.value = parseError(error)
  } finally {
    authorizeLoading.value = false
  }
}

async function handleCallback() {
  const code = takeQueryParam('code')
  const state = takeQueryParam('state')
  const errorParam = takeQueryParam('error')

  if (!code && !errorParam) return

  errorMessage.value = ''
  statusMessage.value = ''

  if (errorParam) {
    const knownError = errorParam === 'access_denied'
      ? localeStore.t('youtubeAuth.accessDenied')
      : parseError(errorParam)
    errorMessage.value = knownError
    clearSession()
    clearQueryParams()
    return
  }

  if (!code) {
    errorMessage.value = localeStore.t('youtubeAuth.missingCode')
    clearSession()
    clearQueryParams()
    return
  }

  const session = loadStoredSession()
  if (!state || !session || session.state !== state || isStateExpired(session)) {
    errorMessage.value = localeStore.t('youtubeAuth.stateMismatch')
    clearSession()
    clearQueryParams()
    return
  }

  exchangeLoading.value = true
  try {
    const result: GoogleAuthCallbackResponse = await apiService.completeGoogleAuth({ code, state })
    isConnected.value = Boolean(result?.connected ?? true)
    connectedChannelLabel.value =
      result?.channel_title ||
      result?.account_email ||
      null
    statusMessage.value = localeStore.t('youtubeAuth.connectedStatus', {
      channel: connectedChannelLabel.value || 'YouTube'
    })
    errorMessage.value = ''
    clearSession()
    clearQueryParams()
  } catch (error) {
    errorMessage.value = parseError(error)
    clearQueryParams()
  } finally {
    exchangeLoading.value = false
  }
}

onMounted(() => {
  handleCallback()
})
</script>

<style scoped>
.youtube-auth-page {
  min-height: calc(100vh - 4rem);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: var(--navy-500);
  margin: 0 0 var(--spacing-xs) 0;
}

.subtitle {
  color: var(--slate-600);
  margin-top: var(--spacing-xs);
}

.auth-card {
  margin-top: var(--spacing-md);
}

.status {
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.status--success {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success);
}

.status--error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
}

.status--info {
  background: var(--slate-50);
  color: var(--navy-800);
}

.auth-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.panel h3 {
  margin: 0;
  color: var(--navy-900);
}

.panel--action {
  padding: var(--spacing-md);
  border: 1px dashed var(--slate-200);
  border-radius: var(--radius-lg);
  background: var(--slate-50);
}

.scope {
  font-family: var(--font-mono, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace);
  background: var(--slate-50);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--slate-200);
  color: var(--navy-800);
  font-size: 0.9rem;
  word-break: break-all;
}

.redirect {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.redirect .label {
  font-weight: 600;
  color: var(--navy-700);
}

.redirect .value {
  font-family: var(--font-mono, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace);
  color: var(--navy-800);
  background: white;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  word-break: break-all;
}

.hint {
  color: var(--slate-600);
  font-size: 0.95rem;
  margin: 0;
}

.hint.muted {
  font-size: 0.85rem;
  color: var(--slate-500);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.inline-loader {
  margin-top: var(--spacing-sm);
}

@media (max-width: 960px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }
}
</style>
