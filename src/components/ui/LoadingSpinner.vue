<template>
  <div :class="['spinner-container', `spinner-container--${size}`]">
    <div class="spinner"></div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  message: ''
})
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

.spinner-container--sm {
  padding: var(--spacing-md);
}

.spinner-container--lg {
  padding: var(--spacing-2xl);
}

.spinner {
  border: 3px solid var(--slate-200);
  border-radius: 50%;
  border-top-color: var(--blue-500);
  animation: spin 0.8s linear infinite;
}

.spinner-container--sm .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-container--md .spinner {
  width: 40px;
  height: 40px;
}

.spinner-container--lg .spinner {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.spinner-message {
  color: var(--navy-600);
  font-size: 0.875rem;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
