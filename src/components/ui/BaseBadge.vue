<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClassificationType } from '@/types/api'

interface Props {
  variant?: 'default' | 'positive' | 'critical' | 'urgent' | 'question' | 'partnership' | 'toxic' | 'spam' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  classificationType?: ClassificationType
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})

const badgeClasses = computed(() => {
  let variant = props.variant

  // Map classification type to variant
  if (props.classificationType !== undefined) {
    const typeMap: Record<number, typeof variant> = {
      [ClassificationType.POSITIVE_FEEDBACK]: 'positive',
      [ClassificationType.CRITICAL_FEEDBACK]: 'critical',
      [ClassificationType.URGENT_ISSUE]: 'urgent',
      [ClassificationType.QUESTION_INQUIRY]: 'question',
      [ClassificationType.PARTNERSHIP_PROPOSAL]: 'partnership',
      [ClassificationType.TOXIC_ABUSIVE]: 'toxic',
      [ClassificationType.SPAM_IRRELEVANT]: 'spam'
    }
    variant = typeMap[props.classificationType] || 'default'
  }

  return [
    'base-badge',
    `base-badge--${variant}`,
    `base-badge--${props.size}`
  ]
})
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: var(--radius-md);
  white-space: nowrap;
}

/* Sizes */
.base-badge--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.base-badge--md {
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
}

.base-badge--lg {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Variants */
.base-badge--default {
  background-color: var(--slate-200);
  color: var(--navy-700);
}

.base-badge--positive {
  background-color: #d1fae5;
  color: #065f46;
}

.base-badge--critical {
  background-color: #fef3c7;
  color: #92400e;
}

.base-badge--urgent {
  background-color: #fee2e2;
  color: #991b1b;
}

.base-badge--question {
  background-color: var(--blue-100);
  color: #1e40af;
}

.base-badge--partnership {
  background-color: #ede9fe;
  color: #5b21b6;
}

.base-badge--toxic {
  background-color: #fecaca;
  color: #7f1d1d;
}

.base-badge--spam {
  background-color: var(--slate-200);
  color: var(--slate-700);
}

.base-badge--success {
  background-color: #d1fae5;
  color: #065f46;
}

.base-badge--warning {
  background-color: #fef3c7;
  color: #92400e;
}

.base-badge--error {
  background-color: #fee2e2;
  color: #991b1b;
}

.base-badge--info {
  background-color: var(--blue-100);
  color: #1e40af;
}
</style>
