<template>
  <v-dialog
    v-model="isOpen"
    max-width="420"
    :persistent="loading"
  >
    <v-card class="pa-6 d-flex flex-column align-center ga-5">
      <v-avatar :color="iconColor.background" size="64">
        <v-icon :color="iconColor.foreground" size="32">
          {{ iconName }}
        </v-icon>
      </v-avatar>

      <div class="text-center d-flex flex-column ga-2">
        <h3 v-if="title" class="text-h6 font-weight-semibold mb-0">
          {{ title }}
        </h3>
        <p class="text-body-2 mb-0">
          {{ message }}
        </p>
      </div>

      <div class="d-flex ga-3 w-100 justify-end">
        <BaseButton
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelButtonText }}
        </BaseButton>
        <BaseButton
          :variant="confirmButtonVariant"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </BaseButton>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()

interface Props {
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'danger' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  variant: 'warning',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!value) {
      emit('update:modelValue', false)
    }
  }
})

const confirmButtonVariant = computed(() => {
  if (props.variant === 'danger') return 'danger'
  if (props.variant === 'info') return 'primary'
  return 'primary'
})

const cancelButtonText = computed(() => props.cancelText ?? localeStore.t('common.actions.cancel'))
const confirmButtonText = computed(() => props.confirmText ?? localeStore.t('common.actions.confirm'))

const iconColor = computed(() => {
  switch (props.variant) {
    case 'danger':
      return { background: '#fee2e2', foreground: '#dc2626' }
    case 'info':
      return { background: '#bfdbfe', foreground: '#1d4ed8' }
    default:
      return { background: '#fde68a', foreground: '#b45309' }
  }
})

const iconName = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'mdi-alert-circle-outline'
    case 'info':
      return 'mdi-information-outline'
    default:
      return 'mdi-help-circle-outline'
  }
})

function handleConfirm() {
  if (!props.loading) {
    emit('confirm')
  }
}

function handleCancel() {
  if (!props.loading) {
    emit('cancel')
    emit('update:modelValue', false)
  }
}
</script>
