<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const authStore = useAuthStore()
const { state: confirmState, handleConfirm, handleCancel } = useConfirm()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div id="app">
    <AppHeader v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <router-view />
    </main>

    <!-- Global Confirm Dialog -->
    <ConfirmDialog
      v-model="confirmState.isOpen"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :variant="confirmState.variant"
      :loading="confirmState.loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
  padding: var(--spacing-xl) 0;
}
</style>
