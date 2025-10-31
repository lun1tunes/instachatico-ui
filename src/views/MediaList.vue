<template>
  <div class="media-list-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ localeStore.t('media.list.title') }}</h1>
        <p class="page-subtitle">{{ localeStore.t('media.list.subtitle') }}</p>
      </div>

      <LoadingSpinner
        v-if="mediaStore.loading && !mediaStore.mediaList.length"
        :message="localeStore.t('media.list.loading')"
      />

      <div v-else-if="mediaStore.error" class="error-state">
        <p>{{ mediaStore.error }}</p>
        <BaseButton @click="loadMedia">
          {{ localeStore.t('common.actions.retry') }}
        </BaseButton>
      </div>

      <div v-else class="media-grid">
        <MediaCard
          v-for="media in mediaStore.mediaList"
          :key="media.id"
          :media="media"
          @click="goToMedia(media.id)"
          @update:comments="(enabled) => handleUpdateSettings(media.id, { is_comment_enabled: enabled })"
          @update:processing="(enabled) => handleUpdateSettings(media.id, { is_processing_enabled: enabled })"
        />
      </div>

      <div v-if="mediaStore.totalPages > 1" class="pagination-wrapper">
        <BasePagination
          :current-page="mediaStore.currentPage"
          :total-pages="mediaStore.totalPages"
          @prev="mediaStore.prevPage"
          @next="mediaStore.nextPage"
          @goto="mediaStore.goToPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import { useLocaleStore } from '@/stores/locale'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import MediaCard from '@/components/media/MediaCard.vue'

const router = useRouter()
const mediaStore = useMediaStore()
const localeStore = useLocaleStore()

onMounted(() => {
  loadMedia()
})

async function loadMedia() {
  try {
    await mediaStore.fetchMedia()
  } catch (error) {
    console.error('Failed to load media:', error)
  }
}

function goToMedia(id: string) {
  router.push(`/media/${id}`)
}

async function handleUpdateSettings(id: string, settings: { is_comment_enabled?: boolean; is_processing_enabled?: boolean }) {
  try {
    await mediaStore.updateMedia(id, settings)
  } catch (error) {
    console.error('Failed to update media settings:', error)
  }
}
</script>

<style scoped>
.media-list-page {
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.error-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.error-state p {
  color: var(--error);
  margin-bottom: var(--spacing-lg);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}
</style>
