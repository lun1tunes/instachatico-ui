import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type {
  Comment,
  CommentsQuery,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  ProcessingStatus
} from '@/types/api'

export const useCommentsStore = defineStore('comments', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Pagination
  const currentPage = ref(1)
  const perPage = ref(30)
  const totalItems = ref(0)

  // Filters
  const statusFilter = ref<ProcessingStatus[]>([])

  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  async function fetchComments(mediaId: number, query?: CommentsQuery) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getComments(mediaId, query || {
        page: currentPage.value,
        per_page: perPage.value,
        status: statusFilter.value.length > 0 ? statusFilter.value : undefined
      })

      comments.value = response.payload

      if (response.meta.page) currentPage.value = response.meta.page
      if (response.meta.per_page) perPage.value = response.meta.per_page
      if (response.meta.total) totalItems.value = response.meta.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch comments'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteComment(id: number) {
    loading.value = true
    error.value = null

    try {
      await apiService.deleteComment(id)

      // Remove from local state
      comments.value = comments.value.filter(c => c.id !== id)
      totalItems.value = Math.max(0, totalItems.value - 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete comment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateComment(id: number, data: UpdateCommentRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateComment(id, data)

      // Update in local state
      const index = comments.value.findIndex(c => c.id === id)
      if (index !== -1) {
        comments.value[index] = response.payload
      }

      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update comment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClassification(id: number, data: UpdateClassificationRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateCommentClassification(id, data)

      // Update in local state
      const index = comments.value.findIndex(c => c.id === id)
      if (index !== -1) {
        comments.value[index] = response.payload
      }

      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update classification'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setStatusFilter(statuses: ProcessingStatus[]) {
    statusFilter.value = statuses
    currentPage.value = 1 // Reset to first page when filtering
  }

  function clearFilters() {
    statusFilter.value = []
    currentPage.value = 1
  }

  function nextPage(mediaId: number) {
    if (hasNextPage.value) {
      currentPage.value++
      fetchComments(mediaId)
    }
  }

  function prevPage(mediaId: number) {
    if (hasPrevPage.value) {
      currentPage.value--
      fetchComments(mediaId)
    }
  }

  return {
    comments,
    loading,
    error,
    currentPage,
    perPage,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    statusFilter,
    fetchComments,
    deleteComment,
    updateComment,
    updateClassification,
    setStatusFilter,
    clearFilters,
    nextPage,
    prevPage
  }
})
