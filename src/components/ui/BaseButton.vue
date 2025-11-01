<template>
  <v-btn
    :block="fullWidth"
    :color="color"
    :disabled="disabled"
    :loading="loading"
    :size="sizeMap"
    :variant="variantMap"
    :type="type"
    @click="handleClick"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const color = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'secondary'
    case 'success':
      return 'success'
    case 'danger':
      return 'error'
    case 'ghost':
      return 'secondary'
    default:
      return 'primary'
  }
})

const variantMap = computed(() => {
  if (props.variant === 'ghost') {
    return 'text'
  }
  if (props.variant === 'secondary') {
    return 'tonal'
  }
  if (props.variant === 'danger') {
    return 'outlined'
  }
  return 'elevated'
})

const sizeMap = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'small'
    case 'lg':
      return 'large'
    default:
      return 'default'
  }
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
