import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type {
  Comment,
  CommentsQuery,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  ProcessingStatus,
  ClassificationType,
  Classification
} from '@/types/api'
import { ProcessingStatus as ProcessingStatusEnum, ClassificationType as ClassificationTypeEnum } from '@/types/api'

type RawClassification = Partial<Classification> & { type?: number | null }

function normalizeClassification(raw?: RawClassification | null): Classification {
  const classification = raw ?? {}

  const classificationType =
    classification.classification_type ??
    classification.type ??
    null

  const confidence =
    classification.confidence !== undefined && classification.confidence !== null
      ? Number(classification.confidence)
      : null

  return {
    id: classification.id ?? '',
    processing_status:
      classification.processing_status ?? ProcessingStatusEnum.PENDING,
    processing_completed_at: classification.processing_completed_at ?? '',
    last_error: classification.last_error ?? null,
    confidence,
    classification_type: classificationType as Classification['classification_type'],
    reasoning: classification.reasoning ?? ''
  }
}

function normalizeComment(comment: Comment): Comment {
  return {
    ...comment,
    classification: normalizeClassification(comment.classification)
  }
}

export const useCommentsStore = defineStore('comments', () => {
  const allComments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Pagination
  const currentPage = ref(1)
  const perPage = ref(30)
  const totalItems = ref(0)

  // Filters
  const statusFilter = ref<ProcessingStatus[]>([])
  const classificationFilter = ref<ClassificationType[]>([])
  const visibilityFilter = ref<'all' | 'visible' | 'hidden'>('all')
  const deletedFilter = ref<'all' | 'active' | 'deleted'>('all')

  // Computed: Filter and sort comments by visibility, deleted status, and created_at (frontend-only filters)
  const comments = computed(() => {
    let filtered = allComments.value

    // Apply visibility filter (frontend-only)
    if (visibilityFilter.value === 'visible') {
      filtered = filtered.filter(comment => !comment.is_hidden)
    } else if (visibilityFilter.value === 'hidden') {
      filtered = filtered.filter(comment => comment.is_hidden)
    }

    // Apply deleted filter (frontend-only)
    if (deletedFilter.value === 'active') {
      filtered = filtered.filter(comment => !comment.is_deleted)
    } else if (deletedFilter.value === 'deleted') {
      filtered = filtered.filter(comment => comment.is_deleted)
    }

    // Sort by created_at: recent to oldest
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA // Descending order (recent first)
    })
  })

  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  async function fetchComments(mediaId: string, query?: CommentsQuery) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getComments(
        mediaId,
        query || {
          page: currentPage.value,
          per_page: perPage.value,
          status: statusFilter.value.length > 0 ? statusFilter.value : undefined,
          classification_type:
            classificationFilter.value.length > 0 ? classificationFilter.value : undefined
        }
      )

      allComments.value = response.payload.map(normalizeComment)

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

  async function deleteComment(id: string) {
    loading.value = true
    error.value = null

    try {
      await apiService.deleteComment(id)

      // Remove from local state
      allComments.value = allComments.value.filter(c => c.id !== id)
      totalItems.value = Math.max(0, totalItems.value - 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete comment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateComment(id: string, data: UpdateCommentRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateComment(id, data)

      // Update in local state
      const index = allComments.value.findIndex(c => c.id === id)
      if (index !== -1) {
        allComments.value[index] = normalizeComment(response.payload)
      }

      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update comment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClassification(id: string, data: UpdateClassificationRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateCommentClassification(id, data)

      // Update in local state
      const index = allComments.value.findIndex(c => c.id === id)
      if (index !== -1) {
        allComments.value[index] = normalizeComment(response.payload)
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

  function setClassificationFilter(classifications: ClassificationType[]) {
    classificationFilter.value = classifications
    currentPage.value = 1
  }

  function setVisibilityFilter(visibility: 'all' | 'visible' | 'hidden') {
    visibilityFilter.value = visibility
    currentPage.value = 1
  }

  function setDeletedFilter(deleted: 'all' | 'active' | 'deleted') {
    deletedFilter.value = deleted
    currentPage.value = 1
  }

  function clearFilters() {
    statusFilter.value = []
    classificationFilter.value = []
    visibilityFilter.value = 'all'
    deletedFilter.value = 'all'
    currentPage.value = 1
  }

  function clearComments() {
    allComments.value = []
    currentPage.value = 1
    totalItems.value = 0
    error.value = null
  }

  function nextPage(mediaId: string) {
    if (hasNextPage.value) {
      currentPage.value++
      fetchComments(mediaId)
    }
  }

  function prevPage(mediaId: string) {
    if (hasPrevPage.value) {
      currentPage.value--
      fetchComments(mediaId)
    }
  }

  async function deleteAnswer(commentId: string, answerId: string) {
    loading.value = true
    error.value = null

    try {
      await apiService.deleteAnswer(answerId)

      const index = allComments.value.findIndex((comment) => comment.id === commentId)
      if (index !== -1) {
        const comment = allComments.value[index]
        allComments.value[index] = {
          ...comment,
          answers: comment.answers.filter((answer) => answer.id !== answerId)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete answer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAnswer(commentId: string, answerId: string, data: UpdateAnswerRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateAnswer(answerId, data)

      const index = allComments.value.findIndex((comment) => comment.id === commentId)
      if (index !== -1) {
        const comment = allComments.value[index]
        allComments.value[index] = {
          ...comment,
          answers: comment.answers.map((answer) =>
            answer.id === answerId ? response.payload : answer
          )
        }
      }

      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update answer'
      throw err
    } finally {
      loading.value = false
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
    classificationFilter,
    visibilityFilter,
    deletedFilter,
    fetchComments,
    deleteComment,
    updateComment,
    updateClassification,
    updateAnswer,
    deleteAnswer,
    setStatusFilter,
    setClassificationFilter,
    setVisibilityFilter,
    setDeletedFilter,
    clearFilters,
    clearComments,
    nextPage,
    prevPage
  }
})
