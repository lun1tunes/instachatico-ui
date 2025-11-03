<template>
  <div class="comments-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ localeStore.t('comments.page.title') }}</h1>
        <p class="page-subtitle">{{ localeStore.t('comments.page.subtitle') }}</p>
      </div>

      <CommentsSection scope="global" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import CommentsSection from '@/components/comments/CommentsSection.vue'

const localeStore = useLocaleStore()
</script>

<style scoped>
.comments-page {
  min-height: calc(100vh - 4rem);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  color: var(--navy-600);
  font-size: 1rem;
  margin: 0;
}
</style>
