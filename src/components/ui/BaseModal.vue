<template>
  <v-dialog
    v-model="isOpen"
    :max-width="maxWidth"
    :persistent="!closeOnOverlay"
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h3 class="text-h6 font-weight-semibold mb-0">
          <slot name="title">{{ title }}</slot>
        </h3>
        <v-btn
          v-if="closable"
          icon="mdi-close"
          variant="text"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="py-6">
        <slot />
      </v-card-text>

      <template v-if="$slots.footer">
        <v-divider />
        <v-card-actions class="justify-end ga-3 py-4">
          <slot name="footer" />
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closable: true,
  closeOnOverlay: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!value) {
      close()
    } else {
      emit('update:modelValue', value)
    }
  }
})

const maxWidth = computed(() => {
  switch (props.size) {
    case 'sm':
      return 420
    case 'lg':
      return 800
    case 'xl':
      return 960
    default:
      return 600
  }
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>
