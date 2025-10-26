<template>
  <div class="media-detail-page">
    <div class="container">
      <div class="back-button-wrapper">
        <BaseButton variant="ghost" @click="router.back()">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Back to Media
        </BaseButton>
      </div>

      <LoadingSpinner v-if="mediaStore.loading && !mediaStore.currentMedia" message="Loading media..." />

      <div v-else-if="mediaStore.currentMedia" class="media-detail">
        <div class="media-detail__content">
          <MediaDetailCard
            :media="mediaStore.currentMedia"
            @update="handleUpdateMedia"
          />
        </div>

        <div class="media-detail__comments">
          <CommentsSection :media-id="mediaStore.currentMedia.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import type { UpdateMediaRequest } from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import MediaDetailCard from '@/components/media/MediaDetailCard.vue'
import CommentsSection from '@/components/comments/CommentsSection.vue'

const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()

onMounted(() => {
  loadMedia()
})

async function loadMedia() {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    router.push('/media')
    return
  }

  try {
    await mediaStore.fetchMediaById(id)
  } catch (error) {
    console.error('Failed to load media:', error)
  }
}

async function handleUpdateMedia(data: UpdateMediaRequest) {
  const id = Number(route.params.id)
  try {
    await mediaStore.updateMedia(id, data)
  } catch (error) {
    console.error('Failed to update media:', error)
  }
}
</script>

<style scoped>
.media-detail-page {
  min-height: calc(100vh - 4rem);
}

.back-button-wrapper {
  margin-bottom: var(--spacing-lg);
}

.media-detail {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

@media (max-width: 1024px) {
  .media-detail {
    grid-template-columns: 1fr;
  }
}
</style>
