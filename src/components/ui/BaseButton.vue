<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="loading"></span>
    <slot v-else />
  </button>
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

const buttonClasses = computed(() => {
  return [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--disabled': props.disabled || props.loading,
      'base-button--full-width': props.fullWidth
    }
  ]
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
  user-select: none;
}

.base-button:focus-visible {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}

/* Sizes */
.base-button--sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
  gap: 0.375rem;
}

.base-button--md {
  padding: 0.625rem 1.125rem;
  font-size: 0.9375rem;
  border-radius: var(--radius-md);
  gap: 0.5rem;
}

.base-button--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: var(--radius-md);
  gap: 0.625rem;
}

/* Variants */
.base-button--primary {
  background-color: var(--blue-500);
  color: white;
}

.base-button--primary:hover:not(.base-button--disabled) {
  background-color: var(--blue-400);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.base-button--primary:active:not(.base-button--disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.base-button--secondary {
  background-color: var(--slate-200);
  color: var(--navy-800);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background-color: var(--slate-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.base-button--success {
  background-color: var(--success);
  color: white;
}

.base-button--success:hover:not(.base-button--disabled) {
  background-color: #0ea574;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.base-button--danger {
  background-color: var(--error);
  color: white;
}

.base-button--danger:hover:not(.base-button--disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.base-button--ghost {
  background-color: transparent;
  color: var(--navy-700);
  border: 1px solid var(--slate-300);
}

.base-button--ghost:hover:not(.base-button--disabled) {
  background-color: var(--slate-100);
  border-color: var(--slate-400);
}

/* States */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.base-button--full-width {
  width: 100%;
}
</style>
