import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '@/services/api'
import type { Comment, ClassificationType } from '@/types/api'
import { ClassificationType as ClassificationTypeEnum } from '@/types/api'
import { isAfter, parseISO, subHours } from 'date-fns'

export type ClassificationGroupKey = 'questions' | 'positive' | 'negative' | 'urgent' | 'other'

interface ClassificationGroupStats {
  total: number
  lastHour: number
}

interface MediaStatsData {
  totalComments: number
  lastHourComments: number
  classifications: Record<ClassificationGroupKey, ClassificationGroupStats>
  computedAt: string
}

interface MediaStatsState {
  loading: boolean
  error: string | null
  data: MediaStatsData | null
}

const PER_PAGE = 100

const GROUP_DEFINITION: Record<Exclude<ClassificationGroupKey, 'other'>, ClassificationType[]> = {
  questions: [ClassificationTypeEnum.QUESTION_INQUIRY],
  positive: [ClassificationTypeEnum.POSITIVE_FEEDBACK],
  negative: [ClassificationTypeEnum.CRITICAL_FEEDBACK, ClassificationTypeEnum.TOXIC_ABUSIVE],
  urgent: [ClassificationTypeEnum.URGENT_ISSUE]
}

function createEmptyGroups(): Record<ClassificationGroupKey, ClassificationGroupStats> {
  return {
    questions: { total: 0, lastHour: 0 },
    positive: { total: 0, lastHour: 0 },
    negative: { total: 0, lastHour: 0 },
    urgent: { total: 0, lastHour: 0 },
    other: { total: 0, lastHour: 0 }
  }
}

function resolveGroup(type: ClassificationType | null | undefined): ClassificationGroupKey {
  if (!type) return 'other'

  if (GROUP_DEFINITION.questions.includes(type)) return 'questions'
  if (GROUP_DEFINITION.positive.includes(type)) return 'positive'
  if (GROUP_DEFINITION.negative.includes(type)) return 'negative'
  if (GROUP_DEFINITION.urgent.includes(type)) return 'urgent'

  return 'other'
}

function extractClassificationType(comment: Comment): ClassificationType | null {
  const classification: any = (comment as any).classification
  if (!classification) {
    return null
  }

  const rawValue =
    classification.classification_type ??
    classification.type ??
    null

  if (rawValue === null || rawValue === undefined) {
    return null
  }

  const resolved = typeof rawValue === 'string' ? Number(rawValue) : rawValue

  if (!Number.isFinite(resolved)) {
    return null
  }

  return resolved as ClassificationType
}

function parseCommentDate(value: string | undefined) {
  if (!value) return null
  try {
    const parsed = parseISO(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  } catch (_error) {
    return null
  }
}

async function fetchAllComments(mediaId: string): Promise<Comment[]> {
  const collected: Comment[] = []
  let page = 1
  let expectedTotal: number | null = null

  while (true) {
    const response = await apiService.getComments(mediaId, {
      page,
      per_page: PER_PAGE
    })

    collected.push(...response.payload)

    const metaTotal = response.meta.total
    const metaPerPage = response.meta.per_page ?? PER_PAGE

    if (typeof metaTotal === 'number' && metaTotal >= 0) {
      expectedTotal = metaTotal
    }

    const receivedCount = response.payload.length

    // Exit conditions
    if (receivedCount === 0) {
      break
    }

    if (expectedTotal !== null && collected.length >= expectedTotal) {
      break
    }

    if (receivedCount < metaPerPage) {
      break
    }

    page += 1
  }

  return collected
}

function computeStats(comments: Comment[]): MediaStatsData {
  const oneHourAgo = subHours(new Date(), 1)
  const groups = createEmptyGroups()
  let lastHourTotal = 0

  for (const comment of comments) {
    const classificationType = extractClassificationType(comment)
    const group = resolveGroup(classificationType)

    groups[group].total += 1

    const createdAt = parseCommentDate((comment as any).created_at)
    if (createdAt && isAfter(createdAt, oneHourAgo)) {
      groups[group].lastHour += 1
      lastHourTotal += 1
    }
  }

  return {
    totalComments: comments.length,
    lastHourComments: lastHourTotal,
    classifications: groups,
    computedAt: new Date().toISOString()
  }
}

export const useMediaStatsStore = defineStore('media-stats', () => {
  const statsByMediaId = ref<Record<string, MediaStatsState>>({})

  function getDefaultState(): MediaStatsState {
    return {
      loading: false,
      error: null,
      data: null
    }
  }

  function updateState(mediaId: string, patch: Partial<MediaStatsState>) {
    const current = statsByMediaId.value[mediaId] ?? getDefaultState()
    statsByMediaId.value = {
      ...statsByMediaId.value,
      [mediaId]: {
        ...current,
        ...patch
      }
    }
  }

  function getStats(mediaId: string): MediaStatsState {
    return statsByMediaId.value[mediaId] ?? getDefaultState()
  }

  async function fetchStats(mediaId: string) {
    const current = getStats(mediaId)
    if (current.loading) {
      return
    }

    updateState(mediaId, { loading: true, error: null })

    try {
      const comments = await fetchAllComments(mediaId)
      const data = computeStats(comments)

      updateState(mediaId, {
        loading: false,
        data,
        error: null
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load media statistics'

      updateState(mediaId, {
        loading: false,
        error: message
      })
    }
  }

  return {
    getStats,
    fetchStats
  }
})
