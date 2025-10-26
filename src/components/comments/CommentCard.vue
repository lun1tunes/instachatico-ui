<template>
  <BaseCard class="comment-card">
    <div class="comment-header">
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
          {{ comment.is_hidden ? 'Unhide' : 'Hide' }}
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          @click="handleDelete"
          :loading="loading"
        >
          Delete
        </BaseButton>
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
          Edit
        </BaseButton>
      </div>

      <div class="classification-info">
        <BaseBadge :classification-type="comment.classification.type">
          {{ getClassificationLabel(comment.classification.type) }}
        </BaseBadge>

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

        <BaseBadge
          :variant="getProcessingStatusVariant(comment.classification.processing_status)"
          size="sm"
        >
          {{ getProcessingStatusLabel(comment.classification.processing_status) }}
        </BaseBadge>
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
      />
    </div>
  </BaseCard>

  <BaseModal
    v-model="showClassificationModal"
    title="Update Classification"
    size="md"
  >
    <ClassificationForm
      :current-type="comment.classification.type"
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
  ProcessingStatus,
  ClassificationType
} from '@/types/api'
import { ClassificationTypeLabels } from '@/types/api'
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
  delete: [id: number]
  update: [id: number, data: UpdateCommentRequest]
  'update-classification': [id: number, data: UpdateClassificationRequest]
}>()

const loading = ref(false)
const showClassificationModal = ref(false)

const userInitial = computed(() => {
  return props.comment.username.charAt(0).toUpperCase()
})

function getClassificationLabel(type: ClassificationType): string {
  return ClassificationTypeLabels[type] || 'Unknown'
}

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
</script>

<style scoped>
.comment-card {
  border-left: 3px solid var(--blue-500);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.comment-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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
