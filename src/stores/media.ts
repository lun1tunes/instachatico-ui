import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { Media, PaginationQuery, UpdateMediaRequest } from '@/types/api'

export const useMediaStore = defineStore('media', () => {
  const mediaList = ref<Media[]>([])
  const currentMedia = ref<Media | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Pagination
  const currentPage = ref(1)
  const perPage = ref(10)
  const totalItems = ref(0)

  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  async function fetchMedia(query?: PaginationQuery) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getMedia(query || {
        page: currentPage.value,
        per_page: perPage.value
      })

      mediaList.value = response.payload

      if (response.meta.page) currentPage.value = response.meta.page
      if (response.meta.per_page) perPage.value = response.meta.per_page
      if (response.meta.total) totalItems.value = response.meta.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch media'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMediaById(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getMediaById(id)
      currentMedia.value = response.payload
      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch media'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMedia(id: string, data: UpdateMediaRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateMedia(id, data)

      // Update in list if present
      const index = mediaList.value.findIndex(m => m.id === id)
      if (index !== -1) {
        mediaList.value[index] = response.payload
      }

      // Update current media if it's the same
      if (currentMedia.value?.id === id) {
        currentMedia.value = response.payload
      }

      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update media'
      throw err
    } finally {
      loading.value = false
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      fetchMedia()
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      fetchMedia()
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchMedia()
    }
  }

  return {
    mediaList,
    currentMedia,
    loading,
    error,
    currentPage,
    perPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    fetchMedia,
    fetchMediaById,
    updateMedia,
    nextPage,
    prevPage,
    goToPage
  }
})
