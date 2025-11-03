import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type {
  Comment,
  CommentsQuery,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  CreateAnswerRequest,
  ProcessingStatus,
  ClassificationType,
  Classification,
  Media,
  CommentMediaSummary
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

const mediaSummaryCache = new Map<string, CommentMediaSummary>()
const mediaSummaryPromises = new Map<string, Promise<CommentMediaSummary | null>>()

function normalizeMediaId(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

async function resolveMediaPreview(mediaId: string, summary: CommentMediaSummary): Promise<string | null> {
  const childUrls = summary.children_urls ?? []
  const attempts: Array<number | undefined> = []

  if (childUrls.length > 0) {
    for (let index = 0; index < childUrls.length; index += 1) {
      attempts.push(index)
    }
    attempts.push(undefined)
  } else {
    attempts.push(undefined)
  }

  for (const attempt of attempts) {
    try {
      const preview = await apiService.fetchMediaImage(
        mediaId,
        typeof attempt === 'number' ? attempt : undefined
      )
      if (preview) {
        return preview
      }
    } catch (error) {
      console.warn('[Comments Store] Failed to load media preview', error)
    }
  }

  return null
}

function buildMediaSummary(media: Media): CommentMediaSummary {
  const normalizedId = normalizeMediaId(media.id) ?? String(media.id ?? '')
  const raw = media as unknown as Record<string, unknown>

  const previewCandidates = [
    raw.preview_url,
    raw.previewUrl,
    raw.thumbnail_url,
    raw.thumbnailUrl,
    raw.image_url,
    raw.imageUrl,
    raw.media_url,
    raw.mediaUrl,
    media.url
  ]
    .map(candidate => (typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : null))
    .filter((candidate): candidate is string => candidate !== null)

  const childUrls = Array.isArray(raw.children_urls)
    ? (raw.children_urls as string[])
    : Array.isArray(raw.children)
      ? (raw.children as string[])
      : media.children_urls

  return {
    id: normalizedId,
    caption: media.caption,
    url: media.url,
    children_urls: childUrls,
    thumbnail_url: childUrls?.[0] ?? (typeof raw.thumbnail_url === 'string' ? raw.thumbnail_url : undefined),
    preview_url: previewCandidates[0] ?? undefined,
    type: media.type,
    shortcode: media.shortcode,
    posted_at: media.posted_at
  }
}

function extractMediaId(comment: Comment): string | null {
  const raw = comment as Record<string, unknown>

  const direct =
    normalizeMediaId((comment as any)?.media?.id) ??
    normalizeMediaId((comment as any)?.media?.media_id) ??
    normalizeMediaId((comment as any)?.media?.mediaId)

  if (direct) {
    return direct
  }

  const snake = normalizeMediaId(raw.media_id)
  if (snake) {
    return snake
  }

  const camel = normalizeMediaId(raw.mediaId)
  if (camel) {
    return camel
  }

  return null
}

async function getMediaSummary(id: string): Promise<CommentMediaSummary | null> {
  if (mediaSummaryCache.has(id)) {
    return mediaSummaryCache.get(id) ?? null
  }

  if (mediaSummaryPromises.has(id)) {
    return mediaSummaryPromises.get(id) ?? null
  }

  const fetchPromise = (async () => {
    try {
      const response = await apiService.getMediaById(id)
      const summary = buildMediaSummary(response.payload)
      const preview = await resolveMediaPreview(summary.id, summary)
      if (preview) {
        summary.preview_url = preview
      }
      mediaSummaryCache.set(id, summary)
      return summary
    } catch (error) {
      console.warn('[Comments Store] Failed to fetch media summary', id, error)
      return null
    } finally {
      mediaSummaryPromises.delete(id)
    }
  })()

  mediaSummaryPromises.set(id, fetchPromise)
  return fetchPromise
}

async function hydrateMediaSummaries(comments: Comment[]) {
  const uniqueIds = Array.from(
    new Set(
      comments
        .map(extractMediaId)
        .filter((id): id is string => !!id)
    )
  )

  if (uniqueIds.length === 0) {
    return
  }

  const summaries = await Promise.all(uniqueIds.map(id => getMediaSummary(id)))

  const summaryById = new Map<string, CommentMediaSummary>()
  uniqueIds.forEach((id, index) => {
    const summary = summaries[index]
    if (summary) {
      summaryById.set(id, summary)
    }
  })

  if (summaryById.size === 0) {
    return
  }

  comments.forEach(comment => {
    const id = extractMediaId(comment)
    if (!id) return

    const summary = summaryById.get(id)
    if (!summary) return

    comment.media = summary
    ;(comment as unknown as Record<string, unknown>).media_id = summary.id
  })
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

  async function fetchComments(mediaId?: string, query?: CommentsQuery) {
    loading.value = true
    error.value = null

    try {
      const requestQuery =
        query || {
          page: currentPage.value,
          per_page: perPage.value,
          status: statusFilter.value.length > 0 ? statusFilter.value : undefined,
          classification_type:
            classificationFilter.value.length > 0 ? classificationFilter.value : undefined
        }

      const response = mediaId
        ? await apiService.getComments(mediaId, requestQuery)
        : await apiService.getAllComments(requestQuery)

      const normalizedComments = response.payload.map(normalizeComment)

      if (!mediaId) {
        await hydrateMediaSummaries(normalizedComments)
      }

      allComments.value = normalizedComments

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

  /**
   * Fetch comments in background for polling (no loading spinner)
   * Merges new comments AND updates existing ones (badges, classification, answers)
   */
  async function fetchCommentsInBackground(mediaId?: string) {
    try {
      const requestQuery = {
        page: currentPage.value,
        per_page: perPage.value,
        status: statusFilter.value.length > 0 ? statusFilter.value : undefined,
        classification_type:
          classificationFilter.value.length > 0 ? classificationFilter.value : undefined
      }

      const response = mediaId
        ? await apiService.getComments(mediaId, requestQuery)
        : await apiService.getAllComments(requestQuery)

      // Create a Map of existing comments by ID for O(1) lookup
      const existingCommentsMap = new Map(
        allComments.value.map(c => [c.id, c])
      )

      const newComments: Comment[] = []
      const updatedComments: Comment[] = []

      // Process fetched comments
      response.payload.forEach(rawComment => {
        const normalized = normalizeComment(rawComment)
        const existing = existingCommentsMap.get(normalized.id)

        if (!existing) {
          // Truly new comment - mark with isNew flag for animation
          newComments.push({ ...normalized, isNew: true })
        } else {
          // Existing comment - update it but preserve position, no isNew flag
          updatedComments.push(normalized)
        }
      })

      if (!mediaId) {
        await hydrateMediaSummaries([...newComments, ...updatedComments])
      }

      // Update existing comments in place (preserves order, no animation)
      if (updatedComments.length > 0) {
        allComments.value = allComments.value.map(comment => {
          const updated = updatedComments.find(u => u.id === comment.id)
          return updated || comment
        })
      }

      // Prepend new comments to the beginning with animation
      if (newComments.length > 0) {
        allComments.value = [...newComments, ...allComments.value]
      }

      // Update total count
      if (response.meta.total) {
        totalItems.value = response.meta.total
      }
    } catch (err) {
      // Silent fail for background polling - don't set error state
      console.warn('[Comments Store] Background fetch failed:', err)
    }
  }

  /**
   * Mark a single comment as read (remove isNew flag)
   * Used when user interacts with a comment
   */
  function markCommentAsRead(commentId: string) {
    const index = allComments.value.findIndex(c => c.id === commentId)
    if (index !== -1 && allComments.value[index].isNew) {
      allComments.value[index] = { ...allComments.value[index], isNew: false }
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

  function nextPage(mediaId?: string) {
    if (hasNextPage.value) {
      currentPage.value++
      fetchComments(mediaId)
    }
  }

  function prevPage(mediaId?: string) {
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

  async function createAnswer(commentId: string, data: CreateAnswerRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.createAnswer(commentId, data)

      const index = allComments.value.findIndex((comment) => comment.id === commentId)
      if (index !== -1) {
        const comment = allComments.value[index]
        allComments.value[index] = {
          ...comment,
          answers: [...comment.answers, response.payload]
        }
      }

      return response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create answer'
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
    fetchCommentsInBackground,
    deleteComment,
    updateComment,
    updateClassification,
    updateAnswer,
    createAnswer,
    deleteAnswer,
    setStatusFilter,
    setClassificationFilter,
    setVisibilityFilter,
    setDeletedFilter,
    clearFilters,
    clearComments,
    nextPage,
    prevPage,
    markCommentAsRead
  }
})
