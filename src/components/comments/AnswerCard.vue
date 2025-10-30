<template>
  <div class="answer-card" :class="{ 'answer-card--inactive': isInactive }">
    <div class="answer-header">
      <div class="answer-status">
        <!-- Show Reply Error badge if reply failed -->
        <div v-if="hasReplyError" class="reply-error-container">
          <BaseBadge variant="error">
            Reply error
          </BaseBadge>
          <div class="info-icon-wrapper">
            <svg
              class="info-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div class="info-tooltip">
              Possible reason - user deleted comment immediately after publishing
            </div>
          </div>
        </div>

        <!-- Show processing status only if no reply error -->
        <BaseBadge
          v-else-if="!answer.reply_sent || answer.processing_status !== ProcessingStatusEnum.FAILED"
          :variant="getProcessingStatusVariant(answer.processing_status)"
          size="sm"
        >
          {{ getProcessingStatusLabel(answer.processing_status) }}
        </BaseBadge>

        <!-- Show Sent badge only if no reply error -->
        <BaseBadge
          v-if="answer.reply_sent && !hasReplyError"
          variant="success"
          size="sm"
        >
          Sent
        </BaseBadge>
      </div>

      <div v-if="!isInactive" class="answer-actions">
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
      <div v-else class="answer-inactive-label">
        <BaseBadge variant="default" size="sm">
          Inactive (Comment Deleted)
        </BaseBadge>
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
    </div>

    <div class="answer-body">
      <p>{{ answer.answer }}</p>
    </div>

    <!-- Reply Error Display -->
    <div v-if="hasReplyError" class="answer-error">
      <div class="error-header">Reply error</div>
      <div class="error-message">{{ answer.reply_error }}</div>
    </div>

    <!-- Other Errors (processing errors) -->
    <div v-else-if="answer.last_error" class="answer-error">
      <div class="error-header">Error</div>
      <div class="error-message">{{ answer.last_error }}</div>
    </div>

    <!-- Loading Overlay -->
    <Transition name="loading-fade">
      <div v-if="isUpdating" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Updating answer...</div>
        </div>
      </div>
    </Transition>
  </div>

  <FullScreenMarkdownEditor
    v-model="showEditModal"
    title="Edit AI Generated Answer"
    :initial-content="answer.answer"
    placeholder="Edit the AI-generated answer. Markdown formatting is supported..."
    save-button-text="Update Answer"
    @save="handleUpdate"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Answer, ProcessingStatus, UpdateAnswerRequest } from '@/types/api'
import { ProcessingStatus as ProcessingStatusEnum } from '@/types/api'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FullScreenMarkdownEditor from '@/components/ui/FullScreenMarkdownEditor.vue'

interface Props {
  answer: Answer
  isCommentDeleted?: boolean
  isUpdating?: boolean
}

const props = defineProps<Props>()
const isInactive = props.isCommentDeleted || false

const emit = defineEmits<{
  'update-answer': [data: UpdateAnswerRequest]
  'delete-answer': []
}>()

const showEditModal = ref(false)

// Check if there's a reply error
const hasReplyError = computed(() => {
  return props.answer.reply_status === 'failed' && !!props.answer.reply_error
})

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
  showEditModal.value = true
}

function handleUpdate(content: string) {
  const trimmedAnswer = content.trim()
  if (!trimmedAnswer) {
    return
  }

  emit('update-answer', { answer: trimmedAnswer })
}

function handleDelete() {
  emit('delete-answer')
}
</script>

<style scoped>
.answer-card {
  position: relative;
  padding: var(--spacing-xs);
  background-color: white;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--blue-200);
  border-left: 3px solid var(--blue-300);
  border-right: 3px solid var(--blue-300);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-fast);
}

.answer-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border-left-color: var(--blue-400);
  border-right-color: var(--blue-400);
}

/* Inactive state for deleted comments */
.answer-card--inactive {
  opacity: 0.6;
  background-color: var(--slate-50);
  border-color: var(--slate-300);
  border-left-color: var(--slate-400);
  border-right-color: var(--slate-400);
  filter: grayscale(30%);
}

.answer-card--inactive:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left-color: var(--slate-400);
  border-right-color: var(--slate-400);
}

.answer-card--inactive .answer-body {
  background: linear-gradient(135deg, var(--slate-100) 0%, var(--slate-50) 100%);
  border-left-color: var(--slate-300);
  color: var(--slate-600);
}

.answer-card--inactive .answer-body p {
  color: var(--slate-600);
}

.answer-card--inactive .score-fill {
  background: linear-gradient(90deg, var(--slate-400), var(--slate-300));
}

.answer-card--inactive .score-fill.quality {
  background: linear-gradient(90deg, var(--slate-400), var(--slate-300));
}

.answer-inactive-label {
  display: flex;
  align-items: center;
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
  align-items: center;
}

.reply-error-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.info-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;
}

.info-icon {
  width: 1rem;
  height: 1rem;
  color: #dc2626;
  transition: all var(--transition-fast);
}

.info-icon-wrapper:hover .info-icon {
  color: #991b1b;
  transform: scale(1.1);
}

.info-tooltip {
  position: absolute;
  left: -0.4rem;
  bottom: calc(100% + 0.5rem);
  background-color: rgba(248, 250, 252, 0.98);
  backdrop-filter: blur(8px);
  color: var(--navy-800);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  line-height: 1.5;
  min-width: 280px;
  text-align: left;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  pointer-events: none;
  z-index: 1000;
  border: 1px solid var(--slate-200);
  white-space: nowrap;
}

.info-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0.6rem;
  border: 6px solid transparent;
  border-top-color: rgba(248, 250, 252, 0.98);
}

.info-icon-wrapper:hover .info-tooltip {
  opacity: 1;
  visibility: visible;
  bottom: calc(100% + 0.65rem);
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
  padding: var(--spacing-xs) var(--spacing-sm);
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
  border-radius: var(--radius-md);
  border-left: 3px solid #dc2626;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.error-header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #7f1d1d;
}

.error-message {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #991b1b;
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
</style>
