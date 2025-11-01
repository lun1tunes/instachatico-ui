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
  <v-app>
    <AppHeader v-if="authStore.isAuthenticated" />

    <v-main class="py-8">
      <router-view />
    </v-main>

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
  </v-app>
</template>
