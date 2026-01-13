<template>
  <div class="settings-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ localeStore.t('settings.title') }}</h1>
        <p class="page-subtitle">{{ localeStore.t('settings.subtitle') }}</p>
      </div>

      <div class="settings-grid">
        <BaseCard class="account-card" shadow="lg">
          <div class="card-header">
            <div>
              <p class="eyebrow">{{ localeStore.t('settings.account.eyebrow') }}</p>
              <h3>{{ localeStore.t('settings.account.heading') }}</h3>
            </div>
            <BaseButton size="sm" variant="danger" class="logout-button" @click="handleLogout">
              {{ localeStore.t('common.actions.logout') }}
            </BaseButton>
          </div>

          <dl class="account-details">
            <div class="detail-row">
              <dt>{{ localeStore.t('settings.account.username') }}</dt>
              <dd>{{ authStore.user?.username || localeStore.t('settings.account.unknown') }}</dd>
            </div>
          </dl>
        </BaseCard>

        <InstagramAuthPanel />
        <YouTubeAuthPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import InstagramAuthPanel from '@/components/settings/InstagramAuthPanel.vue'
import YouTubeAuthPanel from '@/components/settings/YouTubeAuthPanel.vue'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { apiService } from '@/services/api'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const router = useRouter()

function handleLogout() {
  // Best-effort: disconnect YouTube tokens on logout (ignore failures).
  apiService.disconnectGoogleAccount().catch(() => undefined)
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 4rem);
  background: radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.12), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(15, 23, 42, 0.08), transparent 40%);
}

.settings-page .container {
  position: relative;
  z-index: 1;
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-subtitle {
  color: var(--navy-600);
  font-size: 1rem;
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--spacing-xl);
}

.account-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: var(--navy-500);
  margin: 0 0 var(--spacing-xs) 0;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0;
}

.detail-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

dt {
  font-weight: 600;
  color: var(--navy-700);
}

dd {
  margin: 0;
  color: var(--navy-900);
  word-break: break-word;
}

.logout-button {
  margin-left: auto;
}

@media (max-width: 640px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
