<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </div>

    <div class="base-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: 'md',
  hover: false
})

const cardClasses = computed(() => {
  return [
    'base-card',
    `base-card--padding-${props.padding}`,
    `base-card--shadow-${props.shadow}`,
    {
      'base-card--hover': props.hover
    }
  ]
})
</script>

<style scoped>
.base-card {
  background-color: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

/* Padding */
.base-card--padding-none {
  padding: 0;
}

.base-card--padding-sm .base-card__body {
  padding: var(--spacing-sm);
}

.base-card--padding-md .base-card__body {
  padding: var(--spacing-md);
}

.base-card--padding-lg .base-card__body {
  padding: var(--spacing-lg);
}

@media (max-width: 640px) {
  .base-card--padding-sm .base-card__body {
    padding: var(--spacing-sm) var(--spacing-xs);
  }

  .base-card--padding-md .base-card__body {
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .base-card--padding-lg .base-card__body {
    padding: var(--spacing-lg) var(--spacing-md);
  }
}

/* Shadow */
.base-card--shadow-none {
  box-shadow: none;
  border: 1px solid var(--slate-200);
}

.base-card--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.base-card--shadow-md {
  box-shadow: var(--shadow-md);
}

.base-card--shadow-lg {
  box-shadow: var(--shadow-lg);
}

/* Hover Effect */
.base-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Header */
.base-card__header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--slate-200);
  background-color: var(--slate-50);
}

/* Footer */
.base-card__footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--slate-200);
  background-color: var(--slate-50);
}
</style>
