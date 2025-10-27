<template>
  <div class="answer-card">
    <div class="answer-header">
      <div class="answer-status">
        <!-- Only show processing status if reply hasn't been sent, or if it's completed/processing -->
        <BaseBadge
          v-if="!answer.reply_sent || answer.processing_status !== ProcessingStatusEnum.FAILED"
          :variant="getProcessingStatusVariant(answer.processing_status)"
          size="sm"
        >
          {{ getProcessingStatusLabel(answer.processing_status) }}
        </BaseBadge>

        <BaseBadge
          v-if="answer.reply_sent"
          variant="success"
          size="sm"
        >
          Sent
        </BaseBadge>
      </div>

      <div class="answer-actions">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="openEditModal"
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
        <BaseButton
          variant="danger"
          size="sm"
          @click="handleDelete"
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
          Delete
        </BaseButton>
      </div>
    </div>

    <div class="answer-scores">
      <div class="score">
        <span class="score-label">Confidence:</span>
        <div class="score-bar">
          <div
            class="score-fill"
            :style="{ width: `${answer.confidence}%` }"
          ></div>
        </div>
        <span class="score-value">{{ answer.confidence }}%</span>
      </div>

      <div class="score">
        <span class="score-label">Quality:</span>
        <div class="score-bar">
          <div
            class="score-fill quality"
            :style="{ width: `${answer.quality_score}%` }"
          ></div>
        </div>
        <span class="score-value">{{ answer.quality_score }}%</span>
      </div>
    </div>

    <div class="answer-body">
      <p>{{ answer.answer }}</p>
    </div>

    <div v-if="answer.reply_error || answer.last_error" class="answer-error">
      Error: {{ answer.reply_error || answer.last_error }}
    </div>
  </div>

  <BaseModal
    v-model="showEditModal"
    title="Edit Answer"
    size="md"
  >
    <form @submit.prevent="handleUpdate" class="answer-edit-form">
      <div class="form-group">
        <label for="answerText" class="form-label">Answer</label>
        <textarea
          id="answerText"
          v-model="editedAnswer"
          class="form-textarea"
          rows="4"
          placeholder="Update the generated answer..."
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <BaseButton type="button" variant="ghost" @click="showEditModal = false">
          Cancel
        </BaseButton>
        <BaseButton type="submit" variant="primary">
          Save Changes
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Answer, ProcessingStatus, UpdateAnswerRequest } from '@/types/api'
import { ProcessingStatus as ProcessingStatusEnum } from '@/types/api'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

interface Props {
  answer: Answer
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-answer': [data: UpdateAnswerRequest]
  'delete-answer': []
}>()

const showEditModal = ref(false)
const editedAnswer = ref(props.answer.answer)

watch(
  () => props.answer.answer,
  (newValue) => {
    if (!showEditModal.value) {
      editedAnswer.value = newValue
    }
  }
)

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

function openEditModal() {
  editedAnswer.value = props.answer.answer
  showEditModal.value = true
}

function handleUpdate() {
  const trimmedAnswer = editedAnswer.value.trim()
  if (!trimmedAnswer) {
    return
  }

  emit('update-answer', { answer: trimmedAnswer })
  showEditModal.value = false
}

function handleDelete() {
  emit('delete-answer')
}
</script>

<style scoped>
.answer-card {
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--blue-200);
  border-left: 3px solid var(--blue-300);
  border-right: 3px solid var(--blue-300);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-fast);
}

.answer-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border-left-color: var(--blue-400);
  border-right-color: var(--blue-400);
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--slate-100);
}

.answer-status {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.answer-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.375rem;
}

.answer-scores {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: #fafbfc;
  border-radius: var(--radius-md);
}

.score {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.score-label {
  font-size: 0.75rem;
  color: var(--navy-600);
  font-weight: 500;
  min-width: 4.5rem;
}

.score-bar {
  flex: 1;
  height: 0.5rem;
  background-color: var(--slate-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
  transition: width var(--transition-base);
}

.score-fill.quality {
  background: linear-gradient(90deg, var(--success), #14b8a6);
}

.score-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--navy-700);
  min-width: 2.5rem;
  text-align: right;
}

.answer-body {
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, #f7fef9 0%, #f8fefb 100%);
  border-radius: var(--radius-md);
  border-left: 2px solid #bbf7d0;
}

.answer-body p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--navy-700);
  line-height: 1.5;
  font-weight: 400;
}

.answer-reply-status {
  font-size: 0.75rem;
  color: var(--navy-600);
  margin-top: var(--spacing-sm);
}

.status-label {
  font-weight: 600;
}

.answer-error {
  padding: var(--spacing-sm);
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}

.answer-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--navy-700);
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: var(--font-sans);
  color: var(--navy-800);
  background-color: white;
  transition: all var(--transition-fast);
  resize: vertical;
  min-height: 140px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
