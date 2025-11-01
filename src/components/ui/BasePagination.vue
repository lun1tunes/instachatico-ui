<template>
  <v-pagination
    :model-value="currentPage"
    :length="totalPages"
    :total-visible="maxVisible"
    :prev-aria-label="localeStore.t('pagination.previous')"
    :next-aria-label="localeStore.t('pagination.next')"
    class="justify-center"
    show-first-last-page
    variant="text"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
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
  goto: [page: number]
}>()

const localeStore = useLocaleStore()

function handleUpdate(page: number) {
  emit('goto', page)
}
</script>
