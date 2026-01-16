<template>
  <BaseCard class="instagram-auth-card" padding="lg" shadow="lg">
    <div class="card-header">
      <div>
        <p class="eyebrow">{{ localeStore.t('instagramAuth.eyebrow') }}</p>
        <h3 class="title-row">
          <img class="platform-icon" :src="instagramIconSrc" alt="" aria-hidden="true" />
          {{ localeStore.t('instagramAuth.title') }}
        </h3>
        <p class="subtitle">{{ localeStore.t('instagramAuth.subtitle') }}</p>
      </div>
    </div>

    <div v-if="showNotice" class="notice" :class="`notice--${noticeVariant}`">
      {{ noticeMessage }}
    </div>

    <div v-if="hasAccountMeta" class="meta">
      <span v-if="showStatusBadge" class="status" :class="`status--${statusBadge.variant}`">
        <svg
          v-if="statusBadge.variant === 'success'"
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
        <span v-else class="status-dot" aria-hidden="true"></span>
        <span>{{ statusBadge.label }}</span>
      </span>
      <div v-if="instagramUsername" class="account">
        <span class="label">{{ localeStore.t('instagramAuth.accountLabel') }}</span>
        <span class="value">{{ instagramUsername }}</span>
      </div>
      <div v-if="formattedExpiry" class="expiry">
        <span class="label">{{ localeStore.t('instagramAuth.expiresLabel') }}</span>
        <span class="value">{{ formattedExpiry }}</span>
      </div>
    </div>

    <div class="actions">
      <BaseButton
        fullWidth
        :loading="authorizeLoading"
        :disabled="authorizeLoading || statusLoading || (isConnected && accessTokenValid !== false)"
        @click="startAuthorization"
      >
        {{ localeStore.t('instagramAuth.cta') }}
      </BaseButton>
      <div v-if="isConnected" class="secondary-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          :loading="refreshLoading"
          :disabled="!isConnected || refreshLoading || statusLoading"
          @click="refreshAccess"
        >
          {{ localeStore.t('instagramAuth.refreshCta') }}
        </BaseButton>
        <BaseButton
          size="sm"
          variant="danger"
          :loading="disconnectLoading"
          :disabled="!isConnected || disconnectLoading || statusLoading"
          @click="disconnectDialogOpen = true"
        >
          {{ localeStore.t('instagramAuth.disconnectCta') }}
        </BaseButton>
      </div>
      <p class="hint muted">{{ localeStore.t('instagramAuth.consentHint') }}</p>
    </div>

    <div v-if="statusLoading" class="inline-loader">
      <LoadingSpinner :message="localeStore.t('instagramAuth.loading')" />
    </div>

    <ConfirmDialog
      v-model="disconnectDialogOpen"
      :title="localeStore.t('instagramAuth.disconnectTitle')"
      :message="localeStore.t('instagramAuth.disconnectMessage')"
      :confirmText="localeStore.t('instagramAuth.disconnectConfirm')"
      :cancelText="localeStore.t('common.actions.cancel')"
      variant="danger"
      :loading="disconnectLoading"
      @confirm="confirmDisconnect"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { usePolling } from '@/composables/usePolling'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

type NoticeVariant = 'success' | 'warning' | 'error' | 'info'

const localeStore = useLocaleStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const publicBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const instagramIconSrc = `${publicBase}/assets/platforms/instagram.png`

const authorizeLoading = ref(false)
const refreshLoading = ref(false)
const disconnectLoading = ref(false)
const disconnectDialogOpen = ref(false)
const statusLoading = ref(false)

const isConnected = ref(false)
const accessTokenValid = ref<boolean | null>(null)
const accessTokenExpiresAt = ref<string | null>(null)
const instagramUsername = ref<string | null>(null)

const noticeMessage = ref('')
const noticeVariant = ref<NoticeVariant>('info')

const formattedExpiry = computed(() => {
  if (!accessTokenExpiresAt.value) return ''
  const parsed = parseISO(accessTokenExpiresAt.value)
  if (Number.isNaN(parsed.getTime())) return ''
  const pattern = localeStore.t('formats.date.withTime')
  return format(parsed, pattern, { locale: localeStore.dateLocale })
})

const showNotice = computed(() => noticeMessage.value && noticeVariant.value !== 'success')

const showStatusBadge = computed(() => isConnected.value)

const hasAccountMeta = computed(() => showStatusBadge.value || !!formattedExpiry.value || !!instagramUsername.value)

const statusBadge = computed(() => {
  if (accessTokenValid.value === false) {
    return { label: localeStore.t('instagramAuth.status.needsRefresh'), variant: 'warning' }
  }
  return { label: localeStore.t('instagramAuth.status.connected'), variant: 'success' }
})

const redirectUri = computed(() => {
  const envValue = (import.meta as any)?.env?.VITE_INSTAGRAM_REDIRECT_URI as string | undefined
  if (envValue && typeof envValue === 'string') {
    return envValue
  }
  if (typeof window === 'undefined') return ''
  return buildSettingsRedirectUrl()
})

const { resume: resumePolling, pause: pausePolling } = usePolling(loadStatus, {
  interval: 30000,
  immediate: false
})

function parseQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'string') return value
  return undefined
}

function parseBoolean(value: unknown): boolean | undefined {
  const raw = parseQueryValue(value)
  if (!raw) return undefined
  if (raw === 'true' || raw === '1') return true
  if (raw === 'false' || raw === '0') return false
  return undefined
}

function buildSettingsRedirectUrl(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  const path = `${base || ''}/settings`.replace(/\/{2,}/g, '/')
  return new URL(path, window.location.origin).toString()
}

function setNotice(message: string, variant: NoticeVariant) {
  noticeMessage.value = message
  noticeVariant.value = variant
}

function handleCallbackParams() {
  const status = parseQueryValue(route.query.instagram_status)?.toLowerCase()
  const workerSynced = parseBoolean(route.query.instagram_worker_synced)
  const expiresAt = parseQueryValue(route.query.instagram_access_expires_at)

  if (expiresAt) {
    accessTokenExpiresAt.value = expiresAt
  }

  if (status) {
    if (status === 'connected' || status === 'success') {
      if (workerSynced === false) {
        setNotice(localeStore.t('instagramAuth.workerSyncFailed'), 'warning')
      } else {
        setNotice(localeStore.t('instagramAuth.callbackSuccess'), 'success')
      }
    } else {
      setNotice(localeStore.t('instagramAuth.callbackFailed'), 'error')
    }
  }

  if (status || workerSynced !== undefined || expiresAt) {
    const nextQuery = { ...route.query }
    delete nextQuery.instagram_status
    delete nextQuery.instagram_worker_synced
    delete nextQuery.instagram_access_expires_at
    router.replace({ query: nextQuery }).catch(() => undefined)
  }
}

async function loadStatus() {
  statusLoading.value = true
  try {
    const response = await apiService.getInstagramAccountStatus()
    isConnected.value = Boolean(response?.connected)
    accessTokenValid.value = response?.access_token_valid ?? null
    accessTokenExpiresAt.value = response?.access_token_expires_at ?? accessTokenExpiresAt.value
    instagramUsername.value = response?.username ?? null
  } catch (error) {
    const status = (error as any)?.response?.status || (error as any)?.status
    if (status === 401) {
      authStore.logout()
      setNotice(localeStore.t('auth.login'), 'error')
      return
    }
    setNotice(localeStore.t('instagramAuth.genericError'), 'error')
  } finally {
    statusLoading.value = false
  }
}

async function startAuthorization() {
  if (authorizeLoading.value || statusLoading.value) return
  authorizeLoading.value = true
  noticeMessage.value = ''

  try {
    const token = authStore.accessToken
    if (!token) {
      authStore.logout()
      setNotice(localeStore.t('auth.login'), 'error')
      return
    }

    const response = await apiService.getInstagramAuthRequest(redirectUri.value, {
      returnUrl: true,
      forceReauth: false
    })
    const authUrl = response?.auth_url
    if (!authUrl || typeof authUrl !== 'string') {
      throw new Error(localeStore.t('instagramAuth.genericError'))
    }
    window.location.assign(authUrl)
  } catch (error) {
    const status = (error as any)?.response?.status || (error as any)?.status
    if (status === 401) {
      authStore.logout()
      setNotice(localeStore.t('auth.login'), 'error')
      return
    }
    setNotice(localeStore.t('instagramAuth.genericError'), 'error')
  } finally {
    authorizeLoading.value = false
  }
}

async function refreshAccess() {
  if (refreshLoading.value || statusLoading.value || !isConnected.value) return
  refreshLoading.value = true
  noticeMessage.value = ''

  try {
    const response = await apiService.refreshInstagramAccount()
    accessTokenExpiresAt.value =
      response?.access_token_expires_at ?? accessTokenExpiresAt.value
    await loadStatus()

    if (response?.worker_synced === false) {
      setNotice(localeStore.t('instagramAuth.refreshWorkerSyncFailed'), 'warning')
    } else {
      setNotice(localeStore.t('instagramAuth.refreshSuccess'), 'success')
    }
  } catch (error) {
    const status = (error as any)?.response?.status || (error as any)?.status
    if (status === 401) {
      authStore.logout()
      setNotice(localeStore.t('auth.login'), 'error')
      return
    }
    setNotice(localeStore.t('instagramAuth.genericError'), 'error')
  } finally {
    refreshLoading.value = false
  }
}

async function confirmDisconnect() {
  if (disconnectLoading.value) return
  disconnectLoading.value = true
  noticeMessage.value = ''

  try {
    const response = await apiService.disconnectInstagramAccount()
    disconnectDialogOpen.value = false
    isConnected.value = false
    accessTokenValid.value = null
    accessTokenExpiresAt.value = null
    instagramUsername.value = null
    await loadStatus()

    if (response?.worker_synced === false) {
      setNotice(localeStore.t('instagramAuth.disconnectWorkerSyncFailed'), 'warning')
    } else {
      setNotice(localeStore.t('instagramAuth.disconnectSuccess'), 'success')
    }
  } catch (error) {
    const status = (error as any)?.response?.status || (error as any)?.status
    if (status === 401) {
      authStore.logout()
      setNotice(localeStore.t('auth.login'), 'error')
      disconnectDialogOpen.value = false
      return
    }
    setNotice(localeStore.t('instagramAuth.genericError'), 'error')
  } finally {
    disconnectLoading.value = false
  }
}

onMounted(async () => {
  pausePolling()
  handleCallbackParams()
  await loadStatus()
  resumePolling()
})
</script>

<style scoped>
.instagram-auth-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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
  margin: 0 0 var(--spacing-xs) 0;
}

.title-row {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.platform-icon {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
  border-radius: 0.4rem;
  box-shadow: var(--shadow-sm);
  background: white;
}

.subtitle {
  color: var(--slate-600);
  margin: 0;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid transparent;
}

.status--success {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.28);
  color: var(--success);
}

.status--warning {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.28);
  color: #d97706;
}

.status--muted {
  background: rgba(148, 163, 184, 0.18);
  border-color: rgba(148, 163, 184, 0.3);
  color: var(--navy-600);
}

.status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
}

.status-checkmark {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: currentColor;
}

.notice {
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 600;
}

.notice--success {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success);
}

.notice--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.notice--error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
}

.notice--info {
  background: var(--slate-50);
  color: var(--navy-800);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.account {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 0.85rem;
}

.account .label {
  font-weight: 600;
  color: var(--navy-700);
}

.account .value {
  color: var(--navy-900);
  font-weight: 600;
}

.expiry {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 0.85rem;
}

.expiry .label {
  font-weight: 600;
  color: var(--navy-700);
}

.expiry .value {
  color: var(--navy-900);
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.07), rgba(255, 255, 255, 0.92));
}

.secondary-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-sm);
}

.hint {
  color: var(--slate-600);
  font-size: 0.9rem;
  margin: 0;
}

.hint.muted {
  font-size: 0.85rem;
  color: var(--slate-500);
}

.inline-loader {
  margin-top: var(--spacing-sm);
}

@media (max-width: 640px) {
  .actions {
    padding: var(--spacing-md);
  }
}
</style>
