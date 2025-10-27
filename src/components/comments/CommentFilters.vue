<template>
  <div class="comment-filters">
    <div class="filters-content">
      <div class="filter-group">
        <div class="filter-label">Status</div>
        <div class="filter-buttons">
          <button
            v-for="status in processingStatuses"
            :key="status.value"
            :class="['filter-button', { active: isStatusActive(status.value) }]"
            @click="toggleStatus(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-label">Classification</div>
        <div class="filter-buttons filter-buttons--wrap">
          <button
            v-for="classification in classificationOptions"
            :key="classification.value"
            :class="['filter-button', { active: isClassificationActive(classification.value) }]"
            @click="toggleClassification(classification.value)"
          >
            {{ classification.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="filter-actions">
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="!hasActiveFilters"
        @click="clearFilters"
      >
        Clear All
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ProcessingStatus, ClassificationType, ClassificationTypeLabels } from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  statusFilters: ProcessingStatus[]
  classificationFilters: ClassificationType[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [filters: { statuses: ProcessingStatus[]; classifications: ClassificationType[] }]
}>()

const processingStatuses = [
  { value: ProcessingStatus.PENDING, label: 'Pending' },
  { value: ProcessingStatus.PROCESSING, label: 'Processing' },
  { value: ProcessingStatus.COMPLETED, label: 'Completed' },
  { value: ProcessingStatus.FAILED, label: 'Failed' },
  { value: ProcessingStatus.RETRY, label: 'Retry' }
]

const classificationOptions = [
  {
    value: ClassificationType.POSITIVE_FEEDBACK,
    label: ClassificationTypeLabels[ClassificationType.POSITIVE_FEEDBACK]
  },
  {
    value: ClassificationType.CRITICAL_FEEDBACK,
    label: ClassificationTypeLabels[ClassificationType.CRITICAL_FEEDBACK]
  },
  {
    value: ClassificationType.URGENT_ISSUE,
    label: ClassificationTypeLabels[ClassificationType.URGENT_ISSUE]
  },
  {
    value: ClassificationType.QUESTION_INQUIRY,
    label: ClassificationTypeLabels[ClassificationType.QUESTION_INQUIRY]
  },
  {
    value: ClassificationType.PARTNERSHIP_PROPOSAL,
    label: ClassificationTypeLabels[ClassificationType.PARTNERSHIP_PROPOSAL]
  },
  {
    value: ClassificationType.TOXIC_ABUSIVE,
    label: ClassificationTypeLabels[ClassificationType.TOXIC_ABUSIVE]
  },
  {
    value: ClassificationType.SPAM_IRRELEVANT,
    label: ClassificationTypeLabels[ClassificationType.SPAM_IRRELEVANT]
  }
]

const hasActiveFilters = computed(() => {
  return props.statusFilters.length > 0 || props.classificationFilters.length > 0
})

function isStatusActive(status: ProcessingStatus): boolean {
  return props.statusFilters.includes(status)
}

function isClassificationActive(classification: ClassificationType): boolean {
  return props.classificationFilters.includes(classification)
}

function toggleStatus(status: ProcessingStatus) {
  const newFilters = [...props.statusFilters]
  const index = newFilters.indexOf(status)

  if (index > -1) {
    newFilters.splice(index, 1)
  } else {
    newFilters.push(status)
  }

  emit('update', { statuses: newFilters, classifications: [...props.classificationFilters] })
}

function toggleClassification(classification: ClassificationType) {
  const newFilters = [...props.classificationFilters]
  const index = newFilters.indexOf(classification)

  if (index > -1) {
    newFilters.splice(index, 1)
  } else {
    newFilters.push(classification)
  }

  emit('update', { statuses: [...props.statusFilters], classifications: newFilters })
}

function clearFilters() {
  emit('update', { statuses: [], classifications: [] })
}
</script>

<style scoped>
.comment-filters {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--slate-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--slate-200);
}

.filters-content {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.filter-label {
  font-size: 0.875rem;
  color: var(--navy-600);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-buttons--wrap {
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--slate-300);
  background-color: white;
  color: var(--navy-700);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-button:hover {
  background-color: var(--slate-100);
  border-color: var(--slate-400);
}

.filter-button.active {
  background-color: var(--blue-500);
  color: white;
  border-color: var(--blue-500);
}

.filter-button.active:hover {
  background-color: var(--blue-400);
  border-color: var(--blue-400);
}

.filter-group {
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.filter-actions {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .comment-filters {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}
</style>
