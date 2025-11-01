<template>
  <v-container class="py-8 media-detail-page" max-width="1280">
    <v-row class="mb-6" align="center">
      <v-col cols="12" md="4">
        <BaseButton variant="ghost" @click="goBackToMedia">
          <v-icon start icon="mdi-arrow-left" />
          {{ localeStore.t('media.detail.back') }}
        </BaseButton>
      </v-col>

      <v-col cols="12" md="8">
        <div class="d-flex justify-center justify-md-end align-center w-100">
          <h2 class="text-h5 font-weight-semibold mb-0">
            {{ localeStore.t('media.detail.comments') }}
          </h2>
        </div>
      </v-col>
    </v-row>

    <LoadingSpinner
      v-if="mediaStore.loading && !mediaStore.currentMedia"
      :message="localeStore.t('media.detail.loading')"
    />

    <v-row
      v-else-if="mediaStore.currentMedia"
      class="media-detail-grid"
      align="stretch"
    >
      <v-col cols="12" lg="4">
        <MediaDetailCard
          :loading="updateLoading"
          :media="mediaStore.currentMedia"
          @update="handleUpdateMedia"
        />
      </v-col>

      <v-col cols="12" lg="8">
        <CommentsSection :media-id="mediaStore.currentMedia.id" />
      </v-col>
    </v-row>
  </v-container>
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

const { execute: updateMedia, loading: updateLoading } = useAsyncAction(
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

.media-detail-grid {
  row-gap: 32px;
  column-gap: 32px;
}
</style>
