<template>
  <div class="youtube-auth-page">
    <div class="container">
      <div class="page-header">
        <p class="eyebrow">{{ localeStore.t('youtubeAuth.eyebrow') }}</p>
        <h1>{{ localeStore.t('youtubeAuth.title') }}</h1>
        <p class="subtitle">{{ localeStore.t('youtubeAuth.subtitle') }}</p>
      </div>

      <YouTubeAuthPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import YouTubeAuthPanel from '@/components/settings/YouTubeAuthPanel.vue'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()
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
</style>
