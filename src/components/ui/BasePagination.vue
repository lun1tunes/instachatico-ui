<template>
  <div class="pagination">
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="currentPage === 1"
      @click="emit('prev')"
    >
      {{ localeStore.t('pagination.previous') }}
    </BaseButton>

    <div class="pagination__pages">
      <button
        v-for="page in displayPages"
        :key="page"
        :class="[
          'pagination__page',
          { 'pagination__page--active': page === currentPage },
          { 'pagination__page--ellipsis': page === -1 }
        ]"
        :disabled="page === -1"
        @click="page !== -1 && emit('goto', page)"
      >
        {{ page === -1 ? localeStore.t('pagination.ellipsis') : page }}
      </button>
    </div>

    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="currentPage === totalPages"
      @click="emit('next')"
    >
      {{ localeStore.t('pagination.next') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'
import { useLocaleStore } from '@/stores/locale'

interface Props {
  currentPage: number
  totalPages: number
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 7
})

const emit = defineEmits<{
  prev: []
  next: []
  goto: [page: number]
}>()

const localeStore = useLocaleStore()
const displayPages = computed(() => {
  const pages: number[] = []
  const total = props.totalPages
  const current = props.currentPage
  const max = props.maxVisible

  if (total <= max) {
    // Show all pages
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    const leftOffset = Math.floor((max - 3) / 2)
    const rightOffset = Math.ceil((max - 3) / 2)

    let start = current - leftOffset
    let end = current + rightOffset

    if (start <= 2) {
      start = 2
      end = max - 1
    }

    if (end >= total - 1) {
      end = total - 1
      start = total - max + 2
    }

    if (start > 2) {
      pages.push(-1) // Ellipsis
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < total - 1) {
      pages.push(-1) // Ellipsis
    }

    // Always show last page
    pages.push(total)
  }

  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination__page {
  min-width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  color: var(--navy-700);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination__page:hover:not(.pagination__page--active):not(:disabled) {
  background-color: var(--slate-100);
}

.pagination__page--active {
  background-color: var(--blue-500);
  color: white;
}

.pagination__page--ellipsis {
  cursor: default;
}

.pagination__page:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
