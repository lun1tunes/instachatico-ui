<template>
  <v-app-bar color="surface" density="comfortable" elevation="2">
    <v-container class="d-flex align-center ga-4">
      <RouterLink :to="{ name: 'MediaList' }" class="text-decoration-none">
        <v-toolbar-title class="text-primary font-weight-bold">
          {{ localeStore.t('auth.title') }}
        </v-toolbar-title>
      </RouterLink>

      <v-btn
        :to="{ name: 'MediaList' }"
        class="text-none"
        color="primary"
        rounded="lg"
        :variant="mediaButtonVariant"
      >
        {{ localeStore.t('navigation.media') }}
      </v-btn>

      <v-spacer />

      <LanguageSwitcher />

      <BaseButton
        v-if="authStore.isAuthenticated"
        variant="ghost"
        size="sm"
        @click="handleLogout"
      >
        {{ localeStore.t('navigation.logout') }}
      </BaseButton>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import BaseButton from '@/components/ui/BaseButton.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const mediaButtonVariant = computed(() => {
  const name = route.name?.toString()
  const isOnMedia = name === 'MediaList' || name === 'MediaDetail'
  return isOnMedia ? 'elevated' : 'text'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
