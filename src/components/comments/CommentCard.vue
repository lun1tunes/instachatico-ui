<template>
  <BaseCard class="comment-card">
    <div class="comment-header">
      <div class="comment-meta">
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

      <div class="comment-header-main">
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

        <div class="comment-actions">
          <BaseButton
            variant="ghost"
            size="sm"
            @click="toggleHidden"
            :loading="loading"
          >
            <svg
              v-if="comment.is_hidden"
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z" />
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
              <path d="M3 3 21 21" />
              <path d="M10.73 5.08A8.06 8.06 0 0 1 12 5c6.5 0 10.5 7 10.5 7a18.74 18.74 0 0 1-3.21 4.18" />
              <path d="M6.12 6.11C2.69 8.2 1.5 12 1.5 12s2 4.5 6.35 6.71" />
              <path d="M9.53 9.53A3 3 0 0 0 14.47 14.5" />
              <path d="M12 9v0" />
            </svg>
            <span>{{ comment.is_hidden ? 'Unhide' : 'Hide' }}</span>
          </BaseButton>
        <BaseButton
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
      </div>
    </div>

    </div>

    <div class="comment-body">
      <p :class="{ 'comment-hidden': comment.is_hidden }">
        {{ comment.text }}
      </p>
    </div>

    <div class="comment-classification">
      <div class="classification-header">
        <h4>Classification</h4>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="showClassificationModal = true"
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

      <div class="classification-info">
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

      <div v-if="comment.classification.reasoning" class="classification-reasoning">
        <span class="reasoning-label">Reasoning:</span>
        <p>{{ comment.classification.reasoning }}</p>
      </div>

      <div v-if="comment.classification.last_error" class="classification-error">
        Error: {{ comment.classification.last_error }}
      </div>
    </div>

    <div v-if="comment.answers.length > 0" class="comment-answers">
      <h4>Answers</h4>
      <AnswerCard
        v-for="answer in comment.answers"
        :key="answer.id"
        :answer="answer"
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
import { ref, computed } from 'vue'
import type {
  Comment,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  ProcessingStatus,
  ClassificationType
} from '@/types/api'
import { ClassificationTypeLabels, ProcessingStatus as ProcessingStatusEnum } from '@/types/api'
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

const emit = defineEmits<{
  delete: [id: string]
  update: [id: string, data: UpdateCommentRequest]
  'update-classification': [id: string, data: UpdateClassificationRequest]
  'delete-answer': [commentId: string, answerId: string]
  'update-answer': [commentId: string, answerId: string, data: UpdateAnswerRequest]
}>()

const loading = ref(false)
const showClassificationModal = ref(false)

const userInitial = computed(() => {
  return props.comment.username.charAt(0).toUpperCase()
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

// Only consider classification failed if it has no confidence or reasoning
// If we have data, it means classification succeeded even if status says "Failed"
const isClassificationFailed = computed(() => {
  return (
    props.comment.classification.processing_status === ProcessingStatusEnum.FAILED &&
    props.comment.classification.confidence === null &&
    !props.comment.classification.reasoning
  )
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

async function toggleHidden() {
  loading.value = true
  try {
    emit('update', props.comment.id, {
      is_hidden: !props.comment.is_hidden
    })
  } finally {
    loading.value = false
  }
}

function handleDelete() {
  emit('delete', props.comment.id)
}

function handleUpdateClassification(data: UpdateClassificationRequest) {
  emit('update-classification', props.comment.id, data)
  showClassificationModal.value = false
}

function handleDeleteAnswer(answerId: string) {
  emit('delete-answer', props.comment.id, answerId)
}

function handleUpdateAnswer(answerId: string, data: UpdateAnswerRequest) {
  emit('update-answer', props.comment.id, answerId, data)
}
</script>

<style scoped>
.comment-card {
  border-left: 3px solid var(--blue-500);
}


.comment-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.comment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.comment-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.comment-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.meta-badge {
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--blue-500), var(--navy-700));
  color: white;
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
  margin-bottom: var(--spacing-lg);
}

.comment-body p {
  margin: 0;
  color: var(--navy-700);
  line-height: 1.6;
}

.comment-hidden {
  opacity: 0.5;
  text-decoration: line-through;
}

.comment-classification {
  padding: var(--spacing-md);
  background-color: var(--slate-50);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.classification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.classification-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--navy-700);
}

.classification-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-sm);
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
  margin-top: var(--spacing-sm);
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

.classification-error {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
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
</style>
