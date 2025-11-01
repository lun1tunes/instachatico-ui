<template>
  <div class="d-flex flex-column align-center justify-center ga-4 py-10">
    <v-progress-circular
      :size="sizeMap"
      color="primary"
      indeterminate
    />
    <p v-if="message" class="text-body-2 text-medium-emphasis mb-0 text-center">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  message: ''
})

const sizeMap = computed(() => {
  switch (props.size) {
    case 'sm':
      return 32
    case 'lg':
      return 72
    default:
      return 48
  }
})
</script>
