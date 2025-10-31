<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="confirm-overlay" @click.self="handleCancel">
        <div class="confirm-container" @click.stop>
          <!-- Icon based on variant -->
          <div class="confirm-icon" :class="`confirm-icon--${variant}`">
            <!-- Warning/Danger icon -->
            <svg
              v-if="variant === 'danger'"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <!-- Info icon -->
            <svg
              v-else-if="variant === 'info'"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <!-- Warning icon -->
            <svg
              v-else
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <!-- Content -->
          <div class="confirm-content">
            <h3 v-if="title" class="confirm-title">{{ title }}</h3>
            <p class="confirm-message">{{ message }}</p>
          </div>

          <!-- Actions -->
          <div class="confirm-actions">
            <BaseButton
              variant="ghost"
              @click="handleCancel"
              :disabled="loading"
            >
              {{ cancelButtonText }}
            </BaseButton>
            <BaseButton
              :variant="confirmButtonVariant"
              @click="handleConfirm"
              :loading="loading"
            >
              {{ confirmButtonText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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

const confirmButtonVariant = computed(() => {
  if (props.variant === 'danger') return 'danger'
  if (props.variant === 'info') return 'primary'
  return 'primary'
})

const cancelButtonText = computed(() => props.cancelText ?? localeStore.t('common.actions.cancel'))
const confirmButtonText = computed(() => props.confirmText ?? localeStore.t('common.actions.confirm'))

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

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: var(--spacing-lg);
}

.confirm-container {
  background-color: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.confirm-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.confirm-icon--warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.confirm-icon--danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.confirm-icon--info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.confirm-content {
  text-align: center;
}

.confirm-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--navy-900);
}

.confirm-message {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--navy-600);
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
}

.confirm-actions > * {
  flex: 1;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .confirm-container,
.modal-leave-active .confirm-container {
  transition: transform var(--transition-base);
}

.modal-enter-from .confirm-container,
.modal-leave-to .confirm-container {
  transform: scale(0.95) translateY(-10px);
}

/* Responsive */
@media (max-width: 480px) {
  .confirm-actions {
    flex-direction: column-reverse;
  }
}
</style>
