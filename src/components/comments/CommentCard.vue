<template>
  <BaseCard
    class="comment-card"
    :class="{ 'comment-card--new': comment.isNew }"
    padding="sm"
    @mouseenter="handleInteraction"
  >
    <div class="comment-header">
      <div class="comment-header-top">
        <div class="comment-meta">
          <BaseBadge
            v-if="comment.is_deleted"
            variant="error"
            size="sm"
            class="meta-badge"
          >
            Deleted
          </BaseBadge>
          <BaseBadge
            v-if="comment.is_hidden && !comment.is_deleted"
            variant="secondary"
            size="sm"
            class="meta-badge"
          >
            Hidden
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
            <span>{{ isHiding ? 'Unhide' : 'Hide' }}</span>
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
          <span>Delete</span>
        </BaseButton>
        <div
          v-else
          class="deleted-badge-button"
          title="This comment has been permanently deleted from Instagram"
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
          <span>Deleted</span>
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

        <!-- NEW badge positioned under buttons -->
        <div v-if="comment.isNew" class="new-badge">NEW</div>
        </div>
      </div>

      <div class="comment-user">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <span class="username">@{{ comment.username }}</span>
          <BaseBadge
            v-if="comment.parent_id"
            variant="info"
            size="sm"
          >
            Reply
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
        title="Click to toggle classification details"
        @click="toggleClassificationExpanded"
        @keydown.enter.prevent="toggleClassificationExpanded"
        @keydown.space.prevent="toggleClassificationExpanded"
      >
        <h4 class="classification-header-title">
          Classification details
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
            Edit
          </BaseButton>
        </div>
      </div>

      <div v-show="isClassificationExpanded" class="classification-content">
        <div v-if="!isClassificationFailed && comment.classification.processing_completed_at" class="classification-timestamp">
        <span class="timestamp-label">Processed at:</span>
        <time class="timestamp-value">{{ formattedProcessingCompletedAt }}</time>
      </div>

      <div v-if="!isClassificationFailed" class="classification-info">
        <div v-if="comment.classification.confidence !== null" class="confidence">
          <span class="confidence-label">Confidence:</span>
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
        <span class="reasoning-label">Reasoning:</span>
        <p>{{ comment.classification.reasoning }}</p>
      </div>

      <div v-if="isClassificationFailed && comment.classification.last_error" class="classification-error">
        <div class="error-header">Error while classification</div>
        <div class="error-details">{{ comment.classification.last_error }}</div>
      </div>
      </div>
    </div>

    <div v-if="comment.answers.length > 0" class="comment-answers">
      <h4>Answers</h4>
      <AnswerCard
        v-for="answer in comment.answers"
        :key="answer.id"
        :answer="answer"
        :is-comment-deleted="comment.is_deleted"
        @delete-answer="handleDeleteAnswer(answer.id)"
        @update-answer="(data) => handleUpdateAnswer(answer.id, data)"
      />
    </div>
  </BaseCard>

  <BaseModal
    v-model="showClassificationModal"
    title="Update Classification"
    size="md"
  >
    <ClassificationForm
      :current-type="comment.classification.classification_type"
      :current-reasoning="comment.classification.reasoning"
      @submit="handleUpdateClassification"
      @cancel="showClassificationModal = false"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type {
  Comment,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  ProcessingStatus,
  ClassificationType
} from '@/types/api'
import { ClassificationTypeLabels, ProcessingStatus as ProcessingStatusEnum } from '@/types/api'
import { format, parseISO } from 'date-fns'
import { useCommentsStore } from '@/stores/comments'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import AnswerCard from './AnswerCard.vue'
import ClassificationForm from './ClassificationForm.vue'

interface Props {
  comment: Comment
}

const props = defineProps<Props>()
const commentsStore = useCommentsStore()

const emit = defineEmits<{
  delete: [id: string]
  update: [id: string, data: UpdateCommentRequest]
  'update-classification': [id: string, data: UpdateClassificationRequest]
  'delete-answer': [commentId: string, answerId: string]
  'update-answer': [commentId: string, answerId: string, data: UpdateAnswerRequest]
}>()

const loading = ref(false)
const hideLoading = ref(false)
const showClassificationModal = ref(false)
const isClassificationExpanded = ref(false)

// Local state for optimistic UI updates
const isHiding = ref(props.comment.is_hidden)

// Watch for prop changes from parent
watch(() => props.comment.is_hidden, (newValue) => {
  isHiding.value = newValue
})

const userInitial = computed(() => {
  return props.comment.username.charAt(0).toUpperCase()
})

const formattedCreatedAt = computed(() => {
  if (!props.comment.created_at) return ''
  try {
    const date = parseISO(props.comment.created_at)
    return format(date, 'MMM d, yyyy HH:mm')
  } catch (error) {
    console.error('Failed to parse created_at date:', error)
    return props.comment.created_at
  }
})

const formattedProcessingCompletedAt = computed(() => {
  if (!props.comment.classification.processing_completed_at) return ''
  try {
    const date = parseISO(props.comment.classification.processing_completed_at)
    return format(date, 'MMM d, yyyy HH:mm')
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

// Hide confidence and reasoning when classification status is FAILED
const isClassificationFailed = computed(() => {
  return props.comment.classification.processing_status === ProcessingStatusEnum.FAILED
})

function getClassificationLabel(type: ClassificationType | null): string {
  if (type === null || type === undefined) {
    return 'Pending Classification'
  }
  return ClassificationTypeLabels[type] || 'Unknown'
}

function getProcessingStatusLabel(status: ProcessingStatus): string {
  const labels: Record<number, string> = {
    [ProcessingStatusEnum.PENDING]: 'Pending',
    [ProcessingStatusEnum.PROCESSING]: 'Processing',
    [ProcessingStatusEnum.COMPLETED]: 'Completed',
    [ProcessingStatusEnum.FAILED]: 'Failed',
    [ProcessingStatusEnum.RETRY]: 'Retry'
  }
  return labels[status] || 'Unknown'
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
function handleInteraction() {
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
  handleInteraction()
  toggleHidden()
}

function handleDelete() {
  handleInteraction()
  emit('delete', props.comment.id)
}

function handleUpdateClassification(data: UpdateClassificationRequest) {
  handleInteraction()
  emit('update-classification', props.comment.id, data)
  showClassificationModal.value = false
}

function handleDeleteAnswer(answerId: string) {
  handleInteraction()
  emit('delete-answer', props.comment.id, answerId)
}

function handleUpdateAnswer(answerId: string, data: UpdateAnswerRequest) {
  handleInteraction()
  emit('update-answer', props.comment.id, answerId, data)
}

function toggleClassificationExpanded() {
  handleInteraction()
  isClassificationExpanded.value = !isClassificationExpanded.value
}
</script>

<style scoped>
.comment-card {
  border-left: 3px solid var(--blue-300);
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
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.comment-header-top {
  display: flex;
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

.comment-answers {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--slate-200);
}

.comment-answers h4 {
  margin: 0 0 var(--spacing-md);
  font-size: 0.875rem;
  color: var(--navy-700);
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
