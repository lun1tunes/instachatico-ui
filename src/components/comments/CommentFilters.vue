<template>
  <div class="comment-filters">
    <div class="filter-label">Filter by status:</div>
    <div class="filter-buttons">
      <button
        v-for="status in processingStatuses"
        :key="status.value"
        :class="['filter-button', { active: isActive(status.value) }]"
        @click="toggleFilter(status.value)"
      >
        {{ status.label }}
      </button>
      <BaseButton
        v-if="currentFilters.length > 0"
        variant="ghost"
        size="sm"
        @click="clearFilters"
      >
        Clear
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProcessingStatus } from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  currentFilters: ProcessingStatus[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [statuses: ProcessingStatus[]]
}>()

const processingStatuses = [
  { value: ProcessingStatus.PENDING, label: 'Pending' },
  { value: ProcessingStatus.PROCESSING, label: 'Processing' },
  { value: ProcessingStatus.COMPLETED, label: 'Completed' },
  { value: ProcessingStatus.FAILED, label: 'Failed' }
]

function isActive(status: ProcessingStatus): boolean {
  return props.currentFilters.includes(status)
}

function toggleFilter(status: ProcessingStatus) {
  const newFilters = [...props.currentFilters]
  const index = newFilters.indexOf(status)

  if (index > -1) {
    newFilters.splice(index, 1)
  } else {
    newFilters.push(status)
  }

  emit('update', newFilters)
}

function clearFilters() {
  emit('update', [])
}
</script>

<style scoped>
.comment-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.875rem;
  color: var(--navy-600);
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-sm);
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
</style>
