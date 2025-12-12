<template>
  <div class="settings-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ localeStore.t('settings.title') }}</h1>
        <p class="page-subtitle">{{ localeStore.t('settings.subtitle') }}</p>
      </div>

      <div class="settings-grid">
        <BaseCard class="account-card">
          <div class="card-header">
            <div>
              <p class="eyebrow">{{ localeStore.t('settings.account.eyebrow') }}</p>
              <h3>{{ localeStore.t('settings.account.heading') }}</h3>
              <p class="card-subtitle">
                {{ localeStore.t('settings.account.description') }}
              </p>
            </div>
          </div>

          <dl class="account-details">
            <div class="detail-row">
              <dt>{{ localeStore.t('settings.account.username') }}</dt>
              <dd>{{ authStore.user?.username || localeStore.t('settings.account.unknown') }}</dd>
            </div>
            <div class="detail-row">
              <dt>{{ localeStore.t('settings.account.apiBase') }}</dt>
              <dd class="mono">{{ authStore.baseUrl || localeStore.t('settings.account.notProvided') }}</dd>
            </div>
            <div class="detail-row">
              <dt>{{ localeStore.t('settings.account.scopes') }}</dt>
              <dd>
                <template v-if="authStore.scopes?.length">
                  <span class="scope-pill" v-for="scope in authStore.scopes" :key="scope">
                    {{ scope }}
                  </span>
                </template>
                <span v-else>{{ localeStore.t('settings.account.noScopes') }}</span>
              </dd>
            </div>
          </dl>

          <div class="actions">
            <BaseButton variant="danger" @click="handleLogout">
              {{ localeStore.t('common.actions.logout') }}
            </BaseButton>
          </div>
        </BaseCard>

        <YouTubeAuthPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import YouTubeAuthPanel from '@/components/settings/YouTubeAuthPanel.vue'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 4rem);
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
  gap: var(--spacing-lg);
}

.account-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: var(--navy-500);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-subtitle {
  margin: var(--spacing-xs) 0 0;
  color: var(--slate-600);
  font-size: 0.95rem;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0;
}

.detail-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: var(--spacing-sm);
  align-items: baseline;
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

.mono {
  font-family: var(--font-mono);
  font-size: 0.9rem;
}

.scope-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--slate-100);
  color: var(--navy-700);
  font-size: 0.85rem;
  margin-right: 0.35rem;
  margin-bottom: 0.35rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

@media (max-width: 640px) {
  .detail-row {
    grid-template-columns: 1fr;
  }
}
</style>
