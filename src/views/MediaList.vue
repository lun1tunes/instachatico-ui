<template>
  <v-container class="py-10 media-list-page" max-width="1280">
    <v-row>
      <v-col cols="12">
        <div class="d-flex flex-column gap-2 mb-8">
          <h1 class="text-h4 font-weight-semibold">
            {{ localeStore.t('media.list.title') }}
          </h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ localeStore.t('media.list.subtitle') }}
          </p>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="mediaStore.loading && !mediaStore.mediaList.length" justify="center">
      <v-col cols="12">
        <LoadingSpinner :message="localeStore.t('media.list.loading')" />
      </v-col>
    </v-row>

    <v-row v-else-if="mediaStore.error" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-alert
          border="start"
          density="compact"
          type="error"
          variant="tonal"
          class="mb-6"
        >
          {{ mediaStore.error }}
        </v-alert>
        <BaseButton @click="loadMedia">
          {{ localeStore.t('common.actions.retry') }}
        </BaseButton>
      </v-col>
    </v-row>

    <v-row v-else class="media-grid-row">
      <v-col
        v-for="media in mediaStore.mediaList"
        :key="media.id"
        cols="12"
        sm="6"
        lg="4"
      >
        <MediaCard
          :media="media"
          @click="goToMedia(media.id)"
          @update:comments="(enabled) => handleUpdateSettings(media.id, { is_comment_enabled: enabled })"
          @update:processing="(enabled) => handleUpdateSettings(media.id, { is_processing_enabled: enabled })"
        />
      </v-col>
    </v-row>

    <v-row v-if="mediaStore.totalPages > 1" class="mt-8" justify="center">
      <v-col cols="12" class="d-flex justify-center">
        <BasePagination
          :current-page="mediaStore.currentPage"
          :total-pages="mediaStore.totalPages"
          @goto="mediaStore.goToPage"
        />
      </v-col>
    </v-row>
  </v-container>
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

.media-grid-row {
  row-gap: 24px;
  column-gap: 24px;
}
</style>
