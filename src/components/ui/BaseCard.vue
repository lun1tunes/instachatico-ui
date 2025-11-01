<template>
  <v-card
    :class="{ 'base-card--hover': hover }"
    :elevation="elevation"
    :variant="variant"
  >
    <template v-if="$slots.header">
      <v-card-item class="py-4 px-6">
        <slot name="header" />
      </v-card-item>
      <v-divider />
    </template>

    <v-card-text :class="bodyPaddingClass">
      <slot />
    </v-card-text>

    <template v-if="$slots.footer">
      <v-divider />
      <v-card-actions class="py-4 px-6">
        <slot name="footer" />
      </v-card-actions>
    </template>
  </v-card>
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

const elevation = computed(() => {
  switch (props.shadow) {
    case 'none':
      return 0
    case 'sm':
      return 2
    case 'lg':
      return 12
    default:
      return 4
  }
})

const variant = computed(() => (props.shadow === 'none' ? 'outlined' : 'elevated'))

const bodyPaddingClass = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'pa-0'
    case 'sm':
      return 'pa-3'
    case 'lg':
      return 'pa-6'
    default:
      return 'pa-4'
  }
})
</script>

<style scoped>
.base-card--hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.base-card--hover:hover {
  transform: translateY(-2px);
}
</style>
