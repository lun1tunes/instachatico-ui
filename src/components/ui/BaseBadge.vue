<template>
  <v-chip
    :color="chipColor"
    :size="sizeMap"
    :text-color="textColor"
    :variant="variantMap"
    class="font-weight-medium"
  >
    <slot />
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClassificationType } from '@/types/api'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'positive'
  | 'critical'
  | 'urgent'
  | 'question'
  | 'partnership'
  | 'toxic'
  | 'spam'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

interface Props {
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  classificationType?: ClassificationType
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})

const resolvedVariant = computed<BadgeVariant>(() => {
  if (props.classificationType !== undefined) {
    const typeMap: Record<number, BadgeVariant> = {
      [ClassificationType.POSITIVE_FEEDBACK]: 'positive',
      [ClassificationType.CRITICAL_FEEDBACK]: 'critical',
      [ClassificationType.URGENT_ISSUE]: 'urgent',
      [ClassificationType.QUESTION_INQUIRY]: 'question',
      [ClassificationType.PARTNERSHIP_PROPOSAL]: 'partnership',
      [ClassificationType.TOXIC_ABUSIVE]: 'toxic',
      [ClassificationType.SPAM_IRRELEVANT]: 'spam'
    }
    return typeMap[props.classificationType] ?? 'default'
  }
  return props.variant
})

const colorMap: Record<BadgeVariant, { background: string; foreground?: string; variant: 'flat' | 'elevated' | 'tonal' | 'outlined' }> = {
  default: { background: '#e2e8f0', foreground: '#1e293b', variant: 'flat' },
  secondary: { background: 'secondary', variant: 'tonal' },
  positive: { background: '#d1fae5', foreground: '#065f46', variant: 'flat' },
  critical: { background: '#fef3c7', foreground: '#92400e', variant: 'flat' },
  urgent: { background: '#fee2e2', foreground: '#991b1b', variant: 'flat' },
  question: { background: '#bfdbfe', foreground: '#1e40af', variant: 'flat' },
  partnership: { background: '#ede9fe', foreground: '#4c1d95', variant: 'flat' },
  toxic: { background: '#fecaca', foreground: '#7f1d1d', variant: 'flat' },
  spam: { background: '#e2e8f0', foreground: '#475569', variant: 'flat' },
  success: { background: 'success', variant: 'tonal' },
  warning: { background: 'warning', variant: 'tonal' },
  error: { background: 'error', variant: 'tonal' },
  info: { background: 'info', variant: 'tonal' }
}

const chipColor = computed(() => colorMap[resolvedVariant.value].background)
const textColor = computed(() => colorMap[resolvedVariant.value].foreground)
const variantMap = computed(() => colorMap[resolvedVariant.value].variant)

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
</script>
