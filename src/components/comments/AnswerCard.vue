<template>
  <div class="answer-card">
    <div class="answer-header">
      <div class="answer-status">
        <BaseBadge
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
    </div>

    <div class="answer-body">
      <p>{{ answer.answer }}</p>
    </div>

    <div v-if="answer.reply_status" class="answer-reply-status">
      <span class="status-label">Reply Status:</span>
      <span>{{ answer.reply_status }}</span>
    </div>

    <div v-if="answer.reply_error || answer.last_error" class="answer-error">
      Error: {{ answer.reply_error || answer.last_error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Answer, ProcessingStatus } from '@/types/api'
import BaseBadge from '@/components/ui/BaseBadge.vue'

interface Props {
  answer: Answer
}

defineProps<Props>()

function getProcessingStatusLabel(status: ProcessingStatus): string {
  const labels: Record<number, string> = {
    0: 'Pending',
    1: 'Processing',
    2: 'Completed',
    3: 'Failed'
  }
  return labels[status] || 'Unknown'
}

function getProcessingStatusVariant(status: ProcessingStatus): 'warning' | 'info' | 'success' | 'error' | 'default' {
  const variants: Record<number, 'warning' | 'info' | 'success' | 'error'> = {
    0: 'warning',
    1: 'info',
    2: 'success',
    3: 'error'
  }
  return variants[status] || 'default'
}
</script>

<style scoped>
.answer-card {
  padding: var(--spacing-md);
  background-color: var(--blue-50);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--blue-500);
}

.answer-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.answer-status {
  display: flex;
  gap: var(--spacing-sm);
}

.answer-scores {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
  min-width: 4rem;
}

.score-bar {
  flex: 1;
  height: 0.375rem;
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
  background: linear-gradient(90deg, var(--success), #0ea574);
}

.score-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--navy-700);
  min-width: 2.5rem;
  text-align: right;
}

.answer-body {
  margin-bottom: var(--spacing-sm);
}

.answer-body p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--navy-700);
  line-height: 1.6;
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
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}
</style>
