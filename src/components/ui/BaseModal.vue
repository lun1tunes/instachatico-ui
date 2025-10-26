<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="sizeClass" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              v-if="closable"
              class="modal-close"
              @click="close"
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

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

const sizeClass = computed(() => `modal-container--${props.size}`)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.modal-overlay {
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
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-container {
  background-color: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.modal-container--sm {
  max-width: 400px;
}

.modal-container--md {
  max-width: 600px;
}

.modal-container--lg {
  max-width: 800px;
}

.modal-container--xl {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--slate-200);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--navy-900);
}

.modal-close {
  background: none;
  border: none;
  color: var(--navy-500);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--slate-100);
  color: var(--navy-700);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--slate-200);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
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

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform var(--transition-base);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-20px);
}
</style>
