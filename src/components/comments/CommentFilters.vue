<template>
  <div class="comment-filters">
    <div class="filters-row">
      <!-- Visibility Filter -->
      <div class="filter-section">
        <span class="filter-label">{{ localeStore.t('comments.filters.visibility') }}:</span>
        <div class="filter-chips">
          <button
            :class="['filter-chip', { active: visibilityFilter === 'all' }]"
            @click="setVisibilityFilter('all')"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
            {{ localeStore.t('comments.filters.visibilityOptions.all') }}
          </button>
          <button
            :class="['filter-chip', { active: visibilityFilter === 'visible' }]"
            @click="setVisibilityFilter('visible')"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {{ localeStore.t('comments.filters.visibilityOptions.visible') }}
          </button>
          <button
            :class="['filter-chip', { active: visibilityFilter === 'hidden' }]"
            @click="setVisibilityFilter('hidden')"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            {{ localeStore.t('comments.filters.visibilityOptions.hidden') }}
          </button>
        </div>
      </div>

      <!-- Deleted Filter -->
      <div class="filter-section">
        <span class="filter-label">{{ localeStore.t('comments.filters.deleted') }}:</span>
        <div class="filter-chips">
          <button
            :class="['filter-chip', { active: deletedFilter === 'all' }]"
            @click="setDeletedFilter('all')"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
            {{ localeStore.t('comments.filters.deletedOptions.all') }}
          </button>
          <button
            :class="['filter-chip', { active: deletedFilter === 'active' }]"
            @click="setDeletedFilter('active')"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ localeStore.t('comments.filters.deletedOptions.active') }}
          </button>
          <button
            :class="['filter-chip', { active: deletedFilter === 'deleted' }]"
            @click="setDeletedFilter('deleted')"
          >
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {{ localeStore.t('comments.filters.deletedOptions.deleted') }}
          </button>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="filter-section">
        <span class="filter-label">{{ localeStore.t('comments.filters.status') }}:</span>
        <div class="filter-chips">
          <button
            v-for="status in processingStatuses"
            :key="status.value"
            :class="['filter-chip', { active: isStatusActive(status.value) }]"
            @click="toggleStatus(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Classification Filter -->
      <div class="filter-section filter-section--full">
        <span class="filter-label">{{ localeStore.t('comments.filters.type') }}:</span>
        <div class="filter-chips filter-chips--wrap">
          <button
            v-for="classification in classificationOptions"
            :key="classification.value"
            :class="['filter-chip', `filter-chip--${classification.variant}`, { active: isClassificationActive(classification.value) }]"
            @click="toggleClassification(classification.value)"
          >
            <span class="filter-chip__label">{{ classification.shortLabel }}</span>
            <span class="filter-chip__count">{{ getClassificationCount(classification.value) }}</span>
          </button>
        </div>
      </div>
    </div>

    <button
      v-if="hasActiveFilters"
      class="clear-button"
      @click="clearFilters"
      :title="localeStore.t('comments.filters.clear')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ProcessingStatus, ClassificationType } from '@/types/api'
import { useLocaleStore } from '@/stores/locale'

type VisibilityFilter = 'all' | 'visible' | 'hidden'
type DeletedFilter = 'all' | 'active' | 'deleted'

interface Props {
  statusFilters: ProcessingStatus[]
  classificationFilters: ClassificationType[]
  visibilityFilter?: VisibilityFilter
  deletedFilter?: DeletedFilter
  classificationCounts?: Partial<Record<ClassificationType, number>>
}

const props = withDefaults(defineProps<Props>(), {
  visibilityFilter: 'all',
  deletedFilter: 'all',
  classificationCounts: () => ({})
})

const emit = defineEmits<{
  update: [filters: {
    statuses: ProcessingStatus[]
    classifications: ClassificationType[]
    visibility: VisibilityFilter
    deleted: DeletedFilter
  }]
}>()

const visibilityFilter = ref<VisibilityFilter>(props.visibilityFilter)
const deletedFilter = ref<DeletedFilter>(props.deletedFilter)
const localeStore = useLocaleStore()
const classificationCounts = computed(() => props.classificationCounts ?? {})

const processingStatuses = computed(() => [
  { value: ProcessingStatus.PENDING, label: localeStore.t('comments.statusLabels.pending') },
  { value: ProcessingStatus.PROCESSING, label: localeStore.t('comments.statusLabels.processing') },
  { value: ProcessingStatus.COMPLETED, label: localeStore.t('comments.statusLabels.completed') },
  { value: ProcessingStatus.FAILED, label: localeStore.t('comments.statusLabels.failed') },
  { value: ProcessingStatus.RETRY, label: localeStore.t('comments.statusLabels.retry') }
])

const classificationOptions = computed(() => [
  {
    value: ClassificationType.POSITIVE_FEEDBACK,
    shortLabel: localeStore.t('comments.classificationLabels.positive'),
    variant: 'positive'
  },
  {
    value: ClassificationType.CRITICAL_FEEDBACK,
    shortLabel: localeStore.t('comments.classificationLabels.critical'),
    variant: 'critical'
  },
  {
    value: ClassificationType.URGENT_ISSUE,
    shortLabel: localeStore.t('comments.classificationLabels.urgent'),
    variant: 'urgent'
  },
  {
    value: ClassificationType.QUESTION_INQUIRY,
    shortLabel: localeStore.t('comments.classificationLabels.question'),
    variant: 'question'
  },
  {
    value: ClassificationType.PARTNERSHIP_PROPOSAL,
    shortLabel: localeStore.t('comments.classificationLabels.partnership'),
    variant: 'partnership'
  },
  {
    value: ClassificationType.TOXIC_ABUSIVE,
    shortLabel: localeStore.t('comments.classificationLabels.toxic'),
    variant: 'toxic'
  },
  {
    value: ClassificationType.SPAM_IRRELEVANT,
    shortLabel: localeStore.t('comments.classificationLabels.spam'),
    variant: 'spam'
  }
])

const hasActiveFilters = computed(() => {
  return props.statusFilters.length > 0 ||
         props.classificationFilters.length > 0 ||
         visibilityFilter.value !== 'all' ||
         deletedFilter.value !== 'all'
})

function isStatusActive(status: ProcessingStatus): boolean {
  return props.statusFilters.includes(status)
}

function isClassificationActive(classification: ClassificationType): boolean {
  return props.classificationFilters.includes(classification)
}

function getClassificationCount(classification: ClassificationType): number {
  return classificationCounts.value[classification] ?? 0
}

function setVisibilityFilter(filter: VisibilityFilter) {
  visibilityFilter.value = filter
  emit('update', {
    statuses: [...props.statusFilters],
    classifications: [...props.classificationFilters],
    visibility: filter,
    deleted: deletedFilter.value
  })
}

function setDeletedFilter(filter: DeletedFilter) {
  deletedFilter.value = filter
  emit('update', {
    statuses: [...props.statusFilters],
    classifications: [...props.classificationFilters],
    visibility: visibilityFilter.value,
    deleted: filter
  })
}

function toggleStatus(status: ProcessingStatus) {
  const newFilters = [...props.statusFilters]
  const index = newFilters.indexOf(status)

  if (index > -1) {
    newFilters.splice(index, 1)
  } else {
    newFilters.push(status)
  }

  emit('update', {
    statuses: newFilters,
    classifications: [...props.classificationFilters],
    visibility: visibilityFilter.value,
    deleted: deletedFilter.value
  })
}

function toggleClassification(classification: ClassificationType) {
  const newFilters = [...props.classificationFilters]
  const index = newFilters.indexOf(classification)

  if (index > -1) {
    newFilters.splice(index, 1)
  } else {
    newFilters.push(classification)
  }

  emit('update', {
    statuses: [...props.statusFilters],
    classifications: newFilters,
    visibility: visibilityFilter.value,
    deleted: deletedFilter.value
  })
}

function clearFilters() {
  visibilityFilter.value = 'all'
  deletedFilter.value = 'all'
  emit('update', { statuses: [], classifications: [], visibility: 'all', deleted: 'all' })
}
</script>

<style scoped>
.comment-filters {
  position: relative;
  padding: var(--spacing-md);
  background: linear-gradient(to bottom, var(--blue-50), white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--blue-200);
}

.filters-row {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-xs) * 2);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-xs) * 2);
  flex-wrap: wrap;
}

.filter-section--full {
  flex: 1 1 100%;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--navy-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 70px;
}

.filter-chips {
  display: flex;
  gap: calc(0.375rem * 2);
  flex-wrap: wrap;
}

.filter-chips--wrap {
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border: 1.5px solid var(--slate-300);
  background-color: white;
  color: var(--navy-700);
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-chip__label {
  display: inline-flex;
  align-items: center;
}

.filter-chip__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  background-color: rgba(59, 130, 246, 0.12);
  color: var(--blue-600);
  font-size: 0.7rem;
  font-weight: 600;
}

.chip-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.filter-chip:hover {
  background-color: var(--slate-50);
  border-color: var(--slate-400);
  transform: translateY(-1px);
}

.filter-chip.active {
  background-color: var(--blue-500);
  color: white;
  border-color: var(--blue-500);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.filter-chip.active:hover {
  background-color: var(--blue-400);
  border-color: var(--blue-400);
}

.filter-chip.active .filter-chip__count {
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
}

/* Classification type color variants */
.filter-chip--positive.active {
  background-color: var(--positive);
  border-color: var(--positive);
}

.filter-chip--critical.active {
  background-color: var(--critical);
  border-color: var(--critical);
}

.filter-chip--urgent.active {
  background-color: var(--urgent);
  border-color: var(--urgent);
}

.filter-chip--question.active {
  background-color: var(--question);
  border-color: var(--question);
}

.filter-chip--partnership.active {
  background-color: var(--partnership);
  border-color: var(--partnership);
}

.filter-chip--toxic.active {
  background-color: var(--toxic);
  border-color: var(--toxic);
}

.filter-chip--spam.active {
  background-color: var(--spam);
  border-color: var(--spam);
  color: white;
}

.clear-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  background-color: var(--slate-200);
  color: var(--navy-600);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button svg {
  width: 1rem;
  height: 1rem;
}

.clear-button:hover {
  background-color: var(--error);
  color: white;
  transform: rotate(90deg);
}

@media (max-width: 768px) {
  .filter-label {
    min-width: 100%;
    margin-bottom: 0.25rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
