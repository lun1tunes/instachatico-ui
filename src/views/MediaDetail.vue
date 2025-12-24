<template>
  <div class="media-detail-page">
    <div class="container">
      <div class="page-header">
        <div class="back-button-wrapper">
          <BaseButton variant="ghost" @click="goBackToMedia">
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
            {{ localeStore.t('media.detail.back') }}
          </BaseButton>
        </div>

        <h2 class="comments-heading">{{ localeStore.t('media.detail.comments') }}</h2>
      </div>

      <LoadingSpinner
        v-if="mediaStore.loading && !mediaStore.currentMedia"
        :message="localeStore.t('media.detail.loading')"
      />

      <div v-else-if="mediaStore.currentMedia" class="media-detail">
        <div class="media-detail__content">
          <MediaDetailCard
            :media="mediaStore.currentMedia"
            @update="handleUpdateMedia"
          />
        </div>

        <div class="media-detail__comments">
          <CommentsSection
            :media-id="mediaStore.currentMedia.id"
            :media-platform="mediaStore.currentMedia.platform"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { UpdateMediaRequest } from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import MediaDetailCard from '@/components/media/MediaDetailCard.vue'
import CommentsSection from '@/components/comments/CommentsSection.vue'
import { useLocaleStore } from '@/stores/locale'

const route = useRoute()
const router = useRouter()
const mediaStore = useMediaStore()
const localeStore = useLocaleStore()

// Setup async action for media updates with duplicate prevention
const { execute: updateMedia } = useAsyncAction(
  async (data: UpdateMediaRequest) => {
    const id = String(route.params.id)
    await mediaStore.updateMedia(id, data)
  },
  {
    onError: (error) => console.error('Failed to update media:', error)
  }
)

onMounted(() => {
  loadMedia()
})

async function loadMedia() {
  const id = String(route.params.id)

  if (!id) {
    router.push('/media')
    return
  }

  try {
    await mediaStore.fetchMediaById(id)
  } catch (error) {
    console.error('Failed to load media:', error)
  }
}

function goBackToMedia() {
  router.push({ name: 'MediaList' })
}

function handleUpdateMedia(data: UpdateMediaRequest) {
  updateMedia(data)
}
</script>

<style scoped>
.media-detail-page {
  min-height: calc(100vh - 4rem);
}

.page-header {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  align-items: center;
}

.back-button-wrapper {
  display: flex;
  align-items: center;
}

.comments-heading {
  margin: 0;
  font-size: 1.5rem;
  color: var(--navy-800);
  text-align: center;
}

.media-detail {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

@media (max-width: 1024px) {
  .page-header {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .media-detail {
    grid-template-columns: 1fr;
  }
}
</style>
