<template>
  <div class="comment-card-wrapper">
    <BaseCard
      class="comment-card"
      :class="{ 'comment-card--new': comment.isNew }"
      padding="sm"
      @mouseenter="handleInteraction"
    >
    <div
      class="comment-card-grid"
      :class="{ 'comment-card-grid--has-media': showMediaInfo }"
    >
      <div class="comment-card-main">
        <div class="comment-header">
          <div class="comment-header-top">
            <div class="comment-meta" :class="{ 'comment-meta--compact': showMediaInfo }">
          <BaseBadge
            v-if="comment.is_deleted"
            variant="error"
            size="sm"
            class="meta-badge"
          >
            {{ localeStore.t('comments.card.deletedBadge') }}
          </BaseBadge>
          <BaseBadge
            v-if="comment.is_hidden && !comment.is_deleted"
            variant="secondary"
            size="sm"
            class="meta-badge"
          >
            {{ localeStore.t('comments.card.hiddenBadge') }}
          </BaseBadge>
          <BaseBadge
            :variant="statusBadgeVariant"
            size="sm"
            class="meta-badge"
          >
            {{ statusBadgeLabel }}
          </BaseBadge>
          <BaseBadge
            v-if="hasClassificationTag"
            :classification-type="comment.classification.classification_type ?? undefined"
            class="meta-badge"
          >
            {{ getClassificationLabel(comment.classification.classification_type) }}
          </BaseBadge>
        </div>

        <div class="comment-actions-wrapper">
          <div class="comment-actions">
          <BaseButton
            v-if="!comment.is_deleted"
            :variant="isHiding ? 'secondary' : 'ghost'"
            size="sm"
            @click="handleToggleHidden"
            :loading="hideLoading"
            :disabled="hideLoading"
          >
            <svg
              v-if="isHiding"
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            <span>{{ hideButtonLabel }}</span>
          </BaseButton>
        <BaseButton
          v-if="!comment.is_deleted"
          variant="danger"
          size="sm"
          @click="handleDelete"
          :loading="loading"
        >
          <svg
            class="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          <span>{{ localeStore.t('common.actions.delete') }}</span>
        </BaseButton>
        <div
          v-else
          class="deleted-badge-button"
          :title="localeStore.t('comments.card.checkInstagram')"
        >
          <svg
            class="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          <span>{{ localeStore.t('comments.card.deletedBadge') }}</span>
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        </div>

        <!-- NEW badge moved to username row -->
        </div>
      </div>

      <div class="comment-user">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <div class="user-line">
            <span class="username">@{{ comment.username }}</span>
            <span
              v-if="comment.isNew"
              class="new-badge new-badge--inline"
              :title="localeStore.t('comments.card.markAsRead')"
              @click="clearNewFlag"
            >{{ localeStore.t('comments.card.newBadge') }}</span>
          </div>
          <BaseBadge
            v-if="comment.parent_id"
            variant="info"
            size="sm"
          >
            {{ localeStore.t('comments.card.replyBadge') }}
          </BaseBadge>
        </div>
      </div>
    </div>

    <div class="comment-body">
      <p :class="{ 'comment-hidden': isHiding }">
        {{ comment.text }}
      </p>
      <time v-if="comment.created_at" class="comment-date">
        {{ formattedCreatedAt }}
      </time>
    </div>

    <div class="comment-classification" :class="{ 'comment-classification--collapsed': !isClassificationExpanded }">
      <div
        class="classification-header"
        :class="{ 'classification-header--collapsed': !isClassificationExpanded }"
        role="button"
        tabindex="0"
        :aria-expanded="isClassificationExpanded ? 'true' : 'false'"
        :title="localeStore.t('comments.card.toggleClassification')"
        @click="toggleClassificationExpanded"
        @keydown.enter.prevent="toggleClassificationExpanded"
        @keydown.space.prevent="toggleClassificationExpanded"
      >
        <h4 class="classification-header-title">
          {{ localeStore.t('comments.card.classificationTitle') }}
          <svg
            class="expand-icon"
            :class="{ 'expand-icon--expanded': isClassificationExpanded }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </h4>
        <div class="classification-header-actions">
          <BaseButton
            variant="ghost"
            size="sm"
            :class="{ 'edit-button-inactive': !isClassificationExpanded }"
            :disabled="!isClassificationExpanded"
            @click.stop="showClassificationModal = true"
          >
            <svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="m16.5 3.5 4 4-11 11H5.5v-6.5l11-11Z" />
            </svg>
            {{ localeStore.t('common.actions.edit') }}
          </BaseButton>
        </div>
      </div>

      <div v-show="isClassificationExpanded" class="classification-content">
        <div v-if="!isClassificationFailed && comment.classification.processing_completed_at" class="classification-timestamp">
        <span class="timestamp-label">{{ localeStore.t('comments.card.processedAt') }}</span>
        <time class="timestamp-value">{{ formattedProcessingCompletedAt }}</time>
      </div>

      <div v-if="!isClassificationFailed" class="classification-info">
        <div v-if="comment.classification.confidence !== null" class="confidence">
          <span class="confidence-label">{{ localeStore.t('comments.card.confidence') }}</span>
          <div class="confidence-bar">
            <div
              class="confidence-fill"
              :style="{ width: `${comment.classification.confidence}%` }"
            ></div>
          </div>
          <span class="confidence-value">{{ comment.classification.confidence }}%</span>
        </div>
      </div>

      <div v-if="!isClassificationFailed && comment.classification.reasoning" class="classification-reasoning">
        <span class="reasoning-label">{{ localeStore.t('comments.card.reasoning') }}</span>
        <p>{{ comment.classification.reasoning }}</p>
      </div>

      <div v-if="isClassificationFailed && comment.classification.last_error" class="classification-error">
        <div class="error-header">{{ localeStore.t('comments.card.errorTitle') }}</div>
        <div class="error-details">{{ comment.classification.last_error }}</div>
      </div>
      </div>
    </div>

    <!-- Create Answer Button (for Question/Inquiry with no answers) -->
    <div v-if="shouldShowCreateAnswerButton" class="create-answer-section">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="openCreateAnswerModal"
      >
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 20v-6l13-13 6 6-13 13H3z" />
          <path d="m16 5 3 3" />
        </svg>
        {{ localeStore.t('comments.card.createAnswer') }}
      </BaseButton>
    </div>

    <div v-if="comment.answers.length > 0" class="comment-answers">
      <h4>{{ localeStore.t('comments.card.answersTitle') }}</h4>
      <AnswerCard
        v-for="answer in comment.answers"
        :key="answer.id"
        :answer="answer"
        :is-comment-deleted="comment.is_deleted"
        :is-updating="updatingAnswerId === answer.id"
        @delete-answer="handleDeleteAnswer(answer.id)"
        @update-answer="(data) => handleUpdateAnswer(answer.id, data)"
      />
    </div>

    <!-- Loading Overlay for Creating Answer -->
    <Transition name="loading-fade">
      <div v-if="isCreatingAnswer" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">{{ localeStore.t('comments.card.loadingAnswer') }}</div>
        </div>
      </div>
    </Transition>
      </div>

      <aside v-if="showMediaInfo" class="comment-card-media">
        <div class="comment-media-summary">
          <component
            :is="mediaLinkComponent"
            v-bind="mediaLinkProps"
            class="comment-media-summary__link"
            :class="{ 'is-disabled': !mediaRoute }"
            :title="mediaLinkTitle"
          >
            <div class="comment-media-summary__thumb">
              <div v-if="mediaPreviewLoading || mediaSummaryLoading" class="comment-media-summary__thumb-skeleton" />
              <img
                v-else-if="mediaPreviewUrl"
                :src="mediaPreviewUrl"
                :alt="mediaCaption"
              />
              <span v-else class="comment-media-summary__thumb-placeholder">
                {{ localeStore.t('comments.media.noPreview') }}
              </span>
            </div>
            <div class="comment-media-summary__caption">
              {{ truncatedMediaCaption }}
            </div>
          </component>
        </div>
      </aside>
    </div>
    </BaseCard>

  <BaseModal
    v-model="showClassificationModal"
    :title="localeStore.t('comments.card.updateClassificationTitle')"
    size="md"
  >
      <ClassificationForm
        :current-type="comment.classification.classification_type"
        :current-reasoning="comment.classification.reasoning"
        @submit="handleUpdateClassification"
        @cancel="showClassificationModal = false"
      />
    </BaseModal>

  <FullScreenMarkdownEditor
    v-model="showCreateAnswerModal"
    :title="localeStore.t('comments.card.createAnswerTitle')"
    :initial-content="''"
    :placeholder="localeStore.t('comments.card.answerPlaceholder')"
    :save-button-text="localeStore.t('comments.card.createAnswer')"
    @save="handleCreateAnswer"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type {
  Comment,
  CommentMediaSummary,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  CreateAnswerRequest,
  ProcessingStatus,
  ClassificationType
} from '@/types/api'
import { ProcessingStatus as ProcessingStatusEnum, ClassificationType as ClassificationTypeEnum } from '@/types/api'
import { format, parseISO } from 'date-fns'
import { useCommentsStore } from '@/stores/comments'
import { useLocaleStore } from '@/stores/locale'
import { apiService } from '@/services/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import FullScreenMarkdownEditor from '@/components/ui/FullScreenMarkdownEditor.vue'
import AnswerCard from './AnswerCard.vue'
import ClassificationForm from './ClassificationForm.vue'

const mediaPreviewCache = new Map<string, string>()
const mediaDetailsCache = new Map<string, CommentMediaSummary>()

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

interface Props {
  comment: Comment
  updatingAnswerId?: string | null
  isCreatingAnswer?: boolean
  showMediaInfo?: boolean
}

const props = defineProps<Props>()
const commentsStore = useCommentsStore()
const localeStore = useLocaleStore()

const emit = defineEmits<{
  delete: [id: string]
  update: [id: string, data: UpdateCommentRequest]
  'update-classification': [id: string, data: UpdateClassificationRequest]
  'delete-answer': [commentId: string, answerId: string]
  'update-answer': [commentId: string, answerId: string, data: UpdateAnswerRequest]
  'create-answer': [commentId: string, data: CreateAnswerRequest]
}>()

const loading = ref(false)
const hideLoading = ref(false)
const showClassificationModal = ref(false)
const showCreateAnswerModal = ref(false)
const isClassificationExpanded = ref(false)

const initialSummaryId = normalizeMediaId(props.comment.media?.id)
const mediaSummary = ref<CommentMediaSummary | null>(
  initialSummaryId
    ? { ...props.comment.media!, id: initialSummaryId }
    : props.comment.media ?? null
)
const mediaSummaryLoading = ref(false)

if (initialSummaryId && mediaSummary.value) {
  mediaDetailsCache.set(initialSummaryId, mediaSummary.value)
}

watch(() => props.comment.media, (newMedia) => {
  if (newMedia) {
    const normalizedId = normalizeMediaId(newMedia.id)
    const normalized = normalizedId ? { ...newMedia, id: normalizedId } : newMedia
    mediaSummary.value = normalized
    if (normalizedId) {
      mediaDetailsCache.set(normalizedId, normalized)
    }
  } else {
    mediaSummary.value = null
  }
  mediaSummaryLoading.value = false
})

// Local state for optimistic UI updates
const isHiding = ref(props.comment.is_hidden)

// Watch for prop changes from parent
watch(() => props.comment.is_hidden, (newValue) => {
  isHiding.value = newValue
})

const userInitial = computed(() => {
  return props.comment.username.charAt(0).toUpperCase()
})

const hideButtonLabel = computed(() =>
  localeStore.t(
    isHiding.value ? 'comments.card.settings.hide.unhide' : 'comments.card.settings.hide.hide'
  )
)

// Check if we should show "Create Answer" button
const shouldShowCreateAnswerButton = computed(() => {
  return (
    props.comment.classification.classification_type === ClassificationTypeEnum.QUESTION_INQUIRY &&
    props.comment.answers.length === 0
  )
})

const formattedCreatedAt = computed(() => {
  if (!props.comment.created_at) return ''
  try {
    const date = parseISO(props.comment.created_at)
    const pattern = localeStore.t('formats.date.withTime')
    return format(date, pattern, { locale: localeStore.dateLocale })
  } catch (error) {
    console.error('Failed to parse created_at date:', error)
    return props.comment.created_at
  }
})

const formattedProcessingCompletedAt = computed(() => {
  if (!props.comment.classification.processing_completed_at) return ''
  try {
    const date = parseISO(props.comment.classification.processing_completed_at)
    const pattern = localeStore.t('formats.date.withTime')
    return format(date, pattern, { locale: localeStore.dateLocale })
  } catch (error) {
    console.error('Failed to parse processing_completed_at date:', error)
    return props.comment.classification.processing_completed_at
  }
})

const hasClassificationTag = computed(() => {
  const status = props.comment.classification.processing_status
  const classificationType = props.comment.classification.classification_type

  const isProcessingState = [
    ProcessingStatusEnum.PENDING,
    ProcessingStatusEnum.PROCESSING,
    ProcessingStatusEnum.FAILED,
    ProcessingStatusEnum.RETRY
  ].includes(status)

  return classificationType !== null && !isProcessingState
})

const statusBadgeVariant = computed(() =>
  getProcessingStatusVariant(props.comment.classification.processing_status)
)

const statusBadgeLabel = computed(() =>
  getProcessingStatusLabel(props.comment.classification.processing_status)
)

const showMediaInfo = computed(() => props.showMediaInfo ?? false)

const resolvedMediaId = computed(() => {
  if (!showMediaInfo.value) return null

  const summaryId = normalizeMediaId(mediaSummary.value?.id)
  if (summaryId) {
    return summaryId
  }

  const raw = props.comment as Record<string, unknown>

  const embedded = raw.media as CommentMediaSummary | undefined
  const embeddedId = embedded ? normalizeMediaId(embedded.id) : null
  if (embeddedId) {
    return embeddedId
  }

  const snakeId = normalizeMediaId(raw.media_id)
  if (snakeId) {
    return snakeId
  }

  const camelId = normalizeMediaId(raw.mediaId)
  if (camelId) {
    return camelId
  }

  return null
})

const directMediaPreview = computed(() => {
  if (!showMediaInfo.value) return null

  if (mediaSummary.value) {
    return (
      mediaSummary.value.preview_url ??
      mediaSummary.value.thumbnail_url ??
      mediaSummary.value.url ??
      null
    )
  }

  const media = (props.comment as Record<string, any>).media
  if (media) {
    return media.preview_url ?? media.thumbnail_url ?? media.url ?? null
  }

  return null
})

const shouldShowMediaSummary = computed(() => {
  if (!showMediaInfo.value) return false
  return !!resolvedMediaId.value || !!directMediaPreview.value || !!mediaSummary.value
})

const mediaCaption = computed(() => {
  if (!shouldShowMediaSummary.value) {
    return ''
  }

  const caption = mediaSummary.value?.caption
  if (typeof caption === 'string' && caption.trim().length > 0) {
    return caption
  }

  if (mediaSummaryLoading.value) {
    return localeStore.t('comments.media.loading')
  }

  if (mediaSummary.value) {
    return localeStore.t('comments.media.noCaption')
  }

  return localeStore.t('comments.media.unavailable')
})

const truncatedMediaCaption = computed(() => {
  const caption = mediaCaption.value
  const limit = 80
  if (caption.length > limit) {
    return `${caption.slice(0, limit - 3)}...`
  }
  return caption
})

const mediaRoute = computed(() => {
  const mediaId = resolvedMediaId.value
  if (!mediaId) return null
  return {
    name: 'MediaDetail',
    params: { id: mediaId }
  }
})

const mediaLinkComponent = computed(() => (mediaRoute.value ? RouterLink : 'div'))

const mediaLinkProps = computed(() => (mediaRoute.value ? { to: mediaRoute.value } : {}))

const mediaLinkTitle = computed(() =>
  mediaRoute.value
    ? localeStore.t('comments.media.openDetails')
    : localeStore.t('comments.media.unavailable')
)

const mediaPreviewUrl = ref<string | null>(null)
const mediaPreviewLoading = ref(false)

async function ensureMediaSummary(mediaId: string) {
  if (mediaSummary.value && mediaSummary.value.id === mediaId) {
    mediaSummaryLoading.value = false
    return
  }

  if (mediaDetailsCache.has(mediaId)) {
    mediaSummary.value = mediaDetailsCache.get(mediaId) ?? null
    mediaSummaryLoading.value = false
    return
  }

  mediaSummaryLoading.value = true

  try {
    const response = await apiService.getMediaById(mediaId)
    const payload = response.payload
    const normalizedId = normalizeMediaId(payload.id) ?? mediaId
    const summary: CommentMediaSummary = {
      id: normalizedId,
      caption: payload.caption,
      url: payload.url,
      children_urls: payload.children_urls,
      thumbnail_url: payload.children_urls?.[0],
      preview_url: payload.url,
      type: payload.type,
      shortcode: payload.shortcode,
      posted_at: payload.posted_at
    }
    mediaDetailsCache.set(mediaId, summary)
    mediaSummary.value = summary
  } catch (error) {
    console.warn('[CommentCard] Failed to load media details:', error)
  } finally {
    mediaSummaryLoading.value = false
  }
}

async function ensureMediaPreview() {
  if (!showMediaInfo.value) {
    mediaPreviewLoading.value = false
    mediaPreviewUrl.value = null
    return
  }

  const mediaId = resolvedMediaId.value
  const direct = directMediaPreview.value

  if (!mediaId) {
    mediaPreviewLoading.value = false
    mediaPreviewUrl.value = direct ?? null
    return
  }

  if (mediaPreviewCache.has(mediaId)) {
    mediaPreviewUrl.value = mediaPreviewCache.get(mediaId) ?? null
    mediaPreviewLoading.value = false
    return
  }

  if (direct) {
    mediaPreviewUrl.value = direct
  } else {
    mediaPreviewUrl.value = null
  }

  mediaPreviewLoading.value = true

  const childUrls = mediaSummary.value?.children_urls ?? []
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
        mediaPreviewCache.set(mediaId, preview)
        mediaPreviewUrl.value = preview
        mediaPreviewLoading.value = false
        return
      }
    } catch (error) {
      console.warn('[CommentCard] Failed to load media preview:', {
        mediaId,
        attempt,
        error
      })
    }
  }

  mediaPreviewLoading.value = false
  if (direct) {
    mediaPreviewCache.set(mediaId, direct)
    mediaPreviewUrl.value = direct
  }
}

watch(resolvedMediaId, (mediaId) => {
  if (!showMediaInfo.value || !mediaId) {
    mediaSummaryLoading.value = false
    return
  }
  void ensureMediaSummary(mediaId)
}, { immediate: true })

watch(
  [showMediaInfo, resolvedMediaId, directMediaPreview, () => mediaSummary.value?.children_urls?.length],
  () => {
    void ensureMediaPreview()
  },
  { immediate: true }
)

// Hide confidence and reasoning when classification status is FAILED
const isClassificationFailed = computed(() => {
  return props.comment.classification.processing_status === ProcessingStatusEnum.FAILED
})

function getClassificationLabel(type: ClassificationType | null): string {
  if (type === null || type === undefined) {
    return localeStore.t('comments.card.pendingClassification')
  }
  const labels: Record<ClassificationType, string> = {
    [ClassificationTypeEnum.POSITIVE_FEEDBACK]: localeStore.t('comments.classificationLabels.positive'),
    [ClassificationTypeEnum.CRITICAL_FEEDBACK]: localeStore.t('comments.classificationLabels.critical'),
    [ClassificationTypeEnum.URGENT_ISSUE]: localeStore.t('comments.classificationLabels.urgent'),
    [ClassificationTypeEnum.QUESTION_INQUIRY]: localeStore.t('comments.classificationLabels.question'),
    [ClassificationTypeEnum.PARTNERSHIP_PROPOSAL]: localeStore.t('comments.classificationLabels.partnership'),
    [ClassificationTypeEnum.TOXIC_ABUSIVE]: localeStore.t('comments.classificationLabels.toxic'),
    [ClassificationTypeEnum.SPAM_IRRELEVANT]: localeStore.t('comments.classificationLabels.spam')
  }
  return labels[type] || localeStore.t('comments.card.pendingClassification')
}

function getProcessingStatusLabel(status: ProcessingStatus): string {
  const labels: Record<number, string> = {
    [ProcessingStatusEnum.PENDING]: localeStore.t('comments.statusLabels.pending'),
    [ProcessingStatusEnum.PROCESSING]: localeStore.t('comments.statusLabels.processing'),
    [ProcessingStatusEnum.COMPLETED]: localeStore.t('comments.statusLabels.completed'),
    [ProcessingStatusEnum.FAILED]: localeStore.t('comments.statusLabels.failed'),
    [ProcessingStatusEnum.RETRY]: localeStore.t('comments.statusLabels.retry')
  }
  return labels[status] || localeStore.t('comments.statusLabels.pending')
}

function getProcessingStatusVariant(status: ProcessingStatus): 'warning' | 'info' | 'success' | 'error' | 'default' {
  const variants: Record<number, 'warning' | 'info' | 'success' | 'error'> = {
    [ProcessingStatusEnum.PENDING]: 'warning',
    [ProcessingStatusEnum.PROCESSING]: 'info',
    [ProcessingStatusEnum.COMPLETED]: 'success',
    [ProcessingStatusEnum.FAILED]: 'error',
    [ProcessingStatusEnum.RETRY]: 'warning'
  }
  return variants[status] || 'default'
}

/**
 * Mark comment as read when user interacts with it
 */
function clearNewFlag() {
  if (props.comment.isNew) {
    commentsStore.markCommentAsRead(props.comment.id)
  }
}

async function toggleHidden() {
  hideLoading.value = true

  try {
    const newHiddenState = !isHiding.value
    emit('update', props.comment.id, {
      is_hidden: newHiddenState
    })
    // Note: isHiding will be updated via the watch when parent updates the prop
  } finally {
    hideLoading.value = false
  }
}

function handleToggleHidden() {
  clearNewFlag()
  toggleHidden()
}

function handleInteraction() {
  clearNewFlag()
}

function handleDelete() {
  clearNewFlag()
  emit('delete', props.comment.id)
}

function handleUpdateClassification(data: UpdateClassificationRequest) {
  clearNewFlag()
  emit('update-classification', props.comment.id, data)
  showClassificationModal.value = false
}

function handleDeleteAnswer(answerId: string) {
  clearNewFlag()
  emit('delete-answer', props.comment.id, answerId)
}

function handleUpdateAnswer(answerId: string, data: UpdateAnswerRequest) {
  clearNewFlag()
  emit('update-answer', props.comment.id, answerId, data)
}

function handleCreateAnswer(content: string) {
  const trimmedAnswer = content.trim()
  if (!trimmedAnswer) {
    return
  }

  emit('create-answer', props.comment.id, { answer: trimmedAnswer })
}

function openCreateAnswerModal() {
  clearNewFlag()
  showCreateAnswerModal.value = true
}

function toggleClassificationExpanded() {
  clearNewFlag()
  isClassificationExpanded.value = !isClassificationExpanded.value
}
</script>

<style scoped>
.comment-card-wrapper {
  position: relative;
}

.comment-card {
  position: relative;
  border-left: 3px solid var(--blue-300);
}

.comment-card-grid {
  display: flex;
  gap: var(--spacing-lg);
}

.comment-card-grid--has-media {
  align-items: flex-start;
}

.comment-card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.comment-card-media {
  flex: 0 0 20%;
  max-width: 20%;
}

/* New comment card with blinking background */
.comment-card--new {
  animation: background-pulse 2s ease-in-out infinite;
  border-left-color: #2563eb;
  border-left-width: 4px;
}

/* Background pulse animation - alternates every 1 second */
@keyframes background-pulse {
  0%, 100% {
    background-color: #eff6ff; /* Light blue */
  }
  50% {
    background-color: #dbeafe; /* Deep blue */
  }
}


.comment-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.comment-header-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.comment-actions-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
  flex-shrink: 0;
  order: 3;
}

/* NEW badge styling - positioned under Hide/Delete buttons */
.new-badge {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  animation: badge-blink 2s ease-in-out infinite;
}

.new-badge--inline {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  cursor: pointer;
}

/* Badge blink animation - alternates every 1 second */
@keyframes badge-blink {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.95);
  }
}

.comment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  flex: 1;
  order: 1;
}

.comment-meta--compact .meta-badge {
  min-width: auto;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
}

.comment-media-summary {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  background-color: var(--slate-50);
  width: 100%;
  flex-shrink: 0;
}

.comment-media-summary__link,
.comment-media-summary__body {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.comment-media-summary__link:hover .comment-media-summary__caption,
.comment-media-summary__link:focus-visible .comment-media-summary__caption {
  color: var(--navy-900);
}

.comment-media-summary__link.is-disabled {
  cursor: default;
  text-decoration: none;
}

.comment-media-summary__link.is-disabled .comment-media-summary__caption {
  color: var(--slate-500);
}

.comment-media-summary__thumb {
  width: 120px;
  flex: 0 0 120px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--slate-200);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.comment-media-summary__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-media-summary__thumb-placeholder {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--slate-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comment-media-summary__thumb-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.8) 25%, rgba(226, 232, 240, 0.3) 50%, rgba(226, 232, 240, 0.8) 75%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}

.comment-media-summary__caption {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--navy-700);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  align-self: center;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1024px) {
  .comment-card-grid {
    flex-direction: column;
  }

  .comment-card-media {
    flex: 1 1 auto;
    width: 100%;
    max-width: none;
  }

  .comment-media-summary {
    width: 100%;
    max-width: none;
  }

  .comment-actions-wrapper {
    order: 2;
    width: 100%;
  }

  .comment-actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}

.comment-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.meta-badge {
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.expand-icon {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform var(--transition-base);
}

.expand-icon--expanded {
  transform: rotate(180deg);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--blue-100);
  color: var(--blue-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.username {
  font-weight: 600;
  color: var(--navy-900);
}

.comment-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.375rem;
}

.comment-body {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, #f3f8ff 0%, #f5f9ff 100%);
  border-left: 2px solid #c7deff;
  border-radius: var(--radius-md);
}

.comment-body p {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--navy-700);
  line-height: 1.5;
}

.comment-date {
  display: block;
  font-size: 0.75rem;
  color: var(--slate-400);
  font-style: italic;
}

.comment-hidden {
  opacity: 0.4;
  color: var(--slate-400);
}

.comment-classification {
  padding: var(--spacing-sm);
  background-color: #fafbfc;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.comment-classification--collapsed {
  margin-bottom: 0;
  padding-bottom: var(--spacing-xs);
}

.classification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  min-height: 2rem;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  transition: opacity var(--transition-fast);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  margin: calc(var(--spacing-xs) * -1);
  margin-bottom: var(--spacing-sm);
}

.classification-header:hover {
  opacity: 0.7;
  background-color: rgba(59, 130, 246, 0.05);
}

.classification-header:focus-visible {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.classification-header--collapsed {
  margin-bottom: 0;
}

.classification-header-actions {
  flex-shrink: 0;
  min-width: 4.5rem;
  display: flex;
  justify-content: flex-end;
}

.classification-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--navy-700);
}

.classification-header-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.875rem;
  color: var(--navy-700);
}

.edit-button-inactive {
  opacity: 0.2;
  pointer-events: none;
  transition: opacity var(--transition-base);
}

.classification-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.confidence {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 200px;
}

.confidence-label {
  font-size: 0.75rem;
  color: var(--navy-600);
  font-weight: 500;
}

.confidence-bar {
  flex: 1;
  height: 0.5rem;
  background-color: var(--slate-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
  transition: width var(--transition-base);
}

.confidence-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--navy-700);
  min-width: 2.5rem;
  text-align: right;
}

.classification-reasoning {
  margin-top: 0.125rem;
}

.reasoning-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--navy-700);
}

.classification-reasoning p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--navy-600);
  line-height: 1.5;
}

.classification-timestamp {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.timestamp-label {
  font-size: 0.75rem;
  color: var(--navy-600);
  font-weight: 500;
}

.timestamp-value {
  font-size: 0.75rem;
  color: var(--slate-400);
  font-style: italic;
}

.classification-error {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--blue-50);
  border-left: 2px solid var(--blue-200);
  border-radius: var(--radius-md);
}

.error-header {
  margin-bottom: var(--spacing-sm);
  color: var(--error);
  font-weight: 600;
  font-size: 0.875rem;
}

.error-details {
  color: var(--navy-600);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.create-answer-section {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--slate-100);
  margin-top: var(--spacing-sm);
}

.create-answer-section .action-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.375rem;
}

.comment-answers {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--slate-200);
}

.comment-answers h4 {
  margin: 0 0 var(--spacing-md);
  font-size: 0.875rem;
  color: var(--navy-700);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--blue-200);
  border-top-color: var(--blue-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--blue-600);
  letter-spacing: 0.01em;
}

/* Loading Fade Transition */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.deleted-badge-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--slate-100), var(--slate-200));
  color: var(--slate-500);
  border: 1px solid var(--slate-300);
  cursor: not-allowed;
  opacity: 0.8;
  user-select: none;
  transition: all var(--transition-fast);
}

.deleted-badge-button:hover {
  background: linear-gradient(135deg, var(--slate-200), var(--slate-300));
  transform: none;
}

.deleted-badge-button .check-icon {
  width: 1rem;
  height: 1rem;
  color: var(--success);
  margin-left: 0.125rem;
}
</style>
