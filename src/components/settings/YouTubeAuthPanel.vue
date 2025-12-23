<template>
  <BaseCard class="auth-card">
    <div class="card-header">
      <div>
        <p class="eyebrow">{{ localeStore.t('youtubeAuth.eyebrow') }}</p>
        <h3>{{ localeStore.t('youtubeAuth.title') }}</h3>
        <p class="subtitle">{{ localeStore.t('youtubeAuth.subtitle') }}</p>
      </div>

      <div v-if="refreshTokenExpiringSoon" class="status status--warning">
        {{ localeStore.t('youtubeAuth.refreshTokenExpiringSoon') }}
      </div>
      <div v-else-if="statusMessage" class="status status--info">
        {{ statusMessage }}
      </div>
      <div v-else-if="errorMessage" class="status status--error">
        {{ errorMessage }}
      </div>
      <div v-else-if="isConnected" class="status status--success">
        <svg
          v-if="isFullyConnected"
          class="status-checkmark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <strong>{{ localeStore.t('youtubeAuth.connectedStatus', { channel: connectedChannelLabel ?? 'YouTube' }) }}</strong>
      </div>
    </div>

    <div class="auth-grid">
      <div class="panel">
        <h4>{{ localeStore.t('youtubeAuth.scopeTitle') }}</h4>
        <p class="scope">{{ requiredScope }}</p>
        <p class="redirect">
          <span class="label">{{ localeStore.t('youtubeAuth.redirectLabel') }}</span>
          <span class="value">{{ redirectUri }}</span>
        </p>
        <p class="hint">{{ localeStore.t('youtubeAuth.redirectNote') }}</p>
      </div>

      <div class="panel panel--action">
        <h4>{{ localeStore.t('youtubeAuth.connectHeading') }}</h4>
        <p class="hint">{{ localeStore.t('youtubeAuth.connectCopy') }}</p>

        <div class="actions">
          <BaseButton
            :loading="authorizeLoading"
            :disabled="statusLoading || authorizeLoading || (isConnected && !needsRefresh && !refreshTokenExpiringSoon)"
            @click="startAuthorization"
          >
            {{
              isConnected && needsRefresh
                ? localeStore.t('youtubeAuth.reconnectCta')
                : refreshTokenExpiringSoon
                  ? localeStore.t('youtubeAuth.reconnectCta')
                  : isConnected && !needsRefresh
                    ? localeStore.t('youtubeAuth.connectedCta')
                    : localeStore.t('youtubeAuth.cta')
            }}
          </BaseButton>
          <BaseButton
            v-if="isConnected"
            variant="danger"
            :loading="disconnectLoading"
            :disabled="authorizeLoading || statusLoading || disconnectLoading"
            @click="disconnectDialogOpen = true"
          >
            {{ localeStore.t('youtubeAuth.disconnectCta') }}
          </BaseButton>
          <p class="hint muted">{{ localeStore.t('youtubeAuth.consentHint') }}</p>
        </div>

        <div v-if="statusLoading" class="inline-loader">
          <LoadingSpinner :message="localeStore.t('youtubeAuth.exchanging')" />
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="disconnectDialogOpen"
      :title="localeStore.t('youtubeAuth.disconnectTitle')"
      :message="localeStore.t('youtubeAuth.disconnectMessage')"
      :confirmText="localeStore.t('youtubeAuth.disconnectConfirm')"
      :cancelText="localeStore.t('common.actions.cancel')"
      variant="danger"
      :loading="disconnectLoading"
      @confirm="confirmDisconnect"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { apiService } from '@/services/api'
import { useLocaleStore } from '@/stores/locale'
import { useAuthStore } from '@/stores/auth'
import type { GoogleAccountStatusResponse } from '@/types/api'

const REQUIRED_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl'

const localeStore = useLocaleStore()
const route = useRoute()
const authStore = useAuthStore()

const authorizeLoading = ref(false)
const statusLoading = ref(false)
const disconnectLoading = ref(false)
const disconnectDialogOpen = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')
const isConnected = ref(false)
const connectedChannelLabel = ref<string | null>(null)
const needsRefresh = ref(false)
const connectedAccountId = ref<string | null>(null)
const refreshTokenExpiresAt = ref<string | null>(null)

const redirectUri = computed(() => {
  const envValue = (import.meta as any)?.env?.VITE_YOUTUBE_REDIRECT_URI as string | undefined
  if (envValue && typeof envValue === 'string') {
    return envValue
  }
  if (typeof window === 'undefined') return ''
  try {
    return buildSettingsRedirectUrl()
  } catch (_error) {
    return ''
  }
})

const requiredScope = computed(() => REQUIRED_SCOPE)

const isFullyConnected = computed(() => isConnected.value && !needsRefresh.value)

const refreshTokenExpiringSoon = computed(() => {
  if (!refreshTokenExpiresAt.value || !isConnected.value) {
    return false
  }
  
  try {
    const expiresAt = new Date(refreshTokenExpiresAt.value)
    const now = new Date()
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    
    // Check if expires within 2 days and hasn't expired yet
    return expiresAt <= twoDaysFromNow && expiresAt > now
  } catch {
    return false
  }
})

function parseError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return localeStore.t('youtubeAuth.genericError')
}

const accountId = computed(() => {
  const raw = route.query.account_id
  if (Array.isArray(raw)) return raw[0] ?? undefined
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined
})

const redirectToParam = computed(() => {
  const raw = route.query.redirect_to
  if (Array.isArray(raw)) return raw[0] ?? undefined
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined
})

function buildSettingsRedirectUrl(): string {
  if (typeof window === 'undefined') return ''
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  const path = `${base || ''}/settings`.replace(/\/{2,}/g, '/')
  return new URL(path, window.location.origin).toString()
}

function isMissingAuthError(message: string) {
  return /missingyoutubeauth/i.test(message)
}

async function loadStatus() {
  statusLoading.value = true
  errorMessage.value = ''
  statusMessage.value = ''
  try {
    const response = await apiService.getGoogleAccountStatus(accountId.value)
    const payload = response as GoogleAccountStatusResponse
    isConnected.value = Boolean(payload?.connected)
    needsRefresh.value = Boolean(payload?.needs_refresh)
    connectedAccountId.value = payload?.account_id ?? null
    connectedChannelLabel.value =
      payload?.channel_title ||
      payload?.account_email ||
      payload?.channel_id ||
      payload?.account_id ||
      null
    refreshTokenExpiresAt.value = payload?.refresh_token_expires_at ?? null
    if (isConnected.value && needsRefresh.value) {
      statusMessage.value = localeStore.t('youtubeAuth.connectedNeedsRefresh')
    } else {
      statusMessage.value = ''
    }
  } catch (error) {
    const message = parseError(error)
    if (isMissingAuthError(message)) {
      statusMessage.value = localeStore.t('youtubeAuth.connectCopy')
      isConnected.value = false
      needsRefresh.value = false
      connectedAccountId.value = null
      refreshTokenExpiresAt.value = null
      return
    }
    errorMessage.value = message
  } finally {
    statusLoading.value = false
  }
}

async function confirmDisconnect() {
  if (disconnectLoading.value) return

  errorMessage.value = ''
  statusMessage.value = ''
  disconnectLoading.value = true

  try {
    const response = await apiService.disconnectGoogleAccount(connectedAccountId.value ?? undefined)
    const workerSynced = response?.worker_synced !== false

    disconnectDialogOpen.value = false
    isConnected.value = false
    needsRefresh.value = false
    connectedChannelLabel.value = null
    connectedAccountId.value = null
    refreshTokenExpiresAt.value = null

    const disconnectedMessage = workerSynced
      ? localeStore.t('youtubeAuth.disconnectedStatus')
      : localeStore.t('youtubeAuth.disconnectedWorkerSyncFailed')
    statusMessage.value = disconnectedMessage

    // Optional: refetch status to confirm
    await loadStatus()

    // Only restore the disconnected message if the refresh did not surface an error.
    // Otherwise, keep the error visible (statusMessage takes precedence in the template).
    if (!errorMessage.value && !isConnected.value) {
      statusMessage.value = disconnectedMessage
    }
  } catch (error) {
    const status = (error as any)?.response?.status || (error as any)?.status
    const detail =
      (error as any)?.response?.data?.detail ||
      (error as any)?.response?.data?.message ||
      parseError(error)

    if (status === 401) {
      authStore.logout()
      errorMessage.value = localeStore.t('auth.login')
      disconnectDialogOpen.value = false
      return
    }

    if (status === 404) {
      disconnectDialogOpen.value = false
      isConnected.value = false
      needsRefresh.value = false
      connectedChannelLabel.value = null
      connectedAccountId.value = null
      refreshTokenExpiresAt.value = null
      const alreadyDisconnectedMessage = localeStore.t('youtubeAuth.alreadyDisconnected')
      statusMessage.value = alreadyDisconnectedMessage
      await loadStatus()
      if (!errorMessage.value && !isConnected.value) {
        statusMessage.value = alreadyDisconnectedMessage
      }
      return
    }

    errorMessage.value = detail || localeStore.t('youtubeAuth.genericError')
  } finally {
    disconnectLoading.value = false
  }
}

async function startAuthorization() {
  if (authorizeLoading.value || statusLoading.value) {
    return
  }
  errorMessage.value = ''
  statusMessage.value = ''
  authorizeLoading.value = true

  try {
    const redirectTo = redirectToParam.value || redirectUri.value || buildSettingsRedirectUrl()
    const token = authStore.accessToken

    if (!token) {
      authStore.logout()
      errorMessage.value = localeStore.t('auth.login')
      return
    }

    // Call backend explicitly with redirect: 'manual' so the browser does not fetch Google in XHR.
    const authorizeUrl = new URL('/api/v1/auth/google/authorize', window.location.origin)
    authorizeUrl.searchParams.set('return_url', 'true')
    if (redirectTo) authorizeUrl.searchParams.set('redirect_to', redirectTo)

    let response: Response
    try {
      response = await fetch(authorizeUrl.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        mode: 'same-origin',
        redirect: 'manual'
      })
    } catch (fetchError) {
      errorMessage.value = parseError(fetchError)
      return
    }

    // Handle redirects manually by reading Location and navigating.
    if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
      const locationHeader = response.headers.get('Location') || response.headers.get('location')
      if (locationHeader) {
        window.location.assign(locationHeader)
        return
      }
      throw new Error(localeStore.t('youtubeAuth.genericError'))
    }

    if (response.status === 401) {
      authStore.logout()
      errorMessage.value = localeStore.t('auth.login')
      return
    }

    if (response.status !== 200) {
      throw new Error(localeStore.t('youtubeAuth.genericError'))
    }

    const contentType = response.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => null)
      const authUrl = (data as any)?.auth_url || (data as any)?.url
      if (typeof authUrl === 'string' && authUrl.trim().length > 0) {
        window.location.assign(authUrl)
        return
      }
    }

    throw new Error(localeStore.t('youtubeAuth.genericError'))
  } catch (error) {
    const status = (error as any)?.response?.status || (error as any)?.status
    const detail =
      (error as any)?.response?.data?.detail ||
      (error as any)?.response?.data?.message ||
      parseError(error)

    if (status === 401) {
      authStore.logout()
      errorMessage.value = localeStore.t('auth.login')
      return
    }

    errorMessage.value = detail || localeStore.t('youtubeAuth.genericError')
  } finally {
    authorizeLoading.value = false
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<style scoped>
.auth-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: var(--navy-500);
  margin: 0;
}

.subtitle {
  color: var(--slate-600);
  margin: 0;
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

.panel h4 {
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

.status {
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 600;
}

.status--success {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.status-checkmark {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: var(--success);
}

.status--error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
}

.status--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.status--info {
  background: var(--slate-50);
  color: var(--navy-800);
}

@media (max-width: 960px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }
}
</style>
