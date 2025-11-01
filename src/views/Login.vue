<template>
  <v-container class="login-page" fluid>
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-8" elevation="10">
          <div class="text-center mb-8">
            <v-avatar color="primary" size="72" variant="tonal" class="mb-4">
              <v-icon color="primary" size="36">mdi-chat</v-icon>
            </v-avatar>
            <h1 class="text-h5 font-weight-bold mb-2">
              {{ localeStore.t('auth.title') }}
            </h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ localeStore.t('auth.subtitle') }}
            </p>
          </div>

          <v-form @submit.prevent="handleLogin" class="d-flex flex-column ga-5">
            <v-text-field
              v-model="username"
              :label="localeStore.t('auth.username')"
              :placeholder="localeStore.t('auth.usernamePlaceholder')"
              autocomplete="username"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              required
              variant="outlined"
            />

            <v-text-field
              v-model="password"
              :label="localeStore.t('auth.password')"
              :placeholder="localeStore.t('auth.passwordPlaceholder')"
              autocomplete="current-password"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              required
              type="password"
              variant="outlined"
            />

            <v-alert
              v-if="authStore.error"
              type="error"
              variant="tonal"
              density="comfortable"
            >
              {{ authStore.error }}
            </v-alert>

            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
            >
              {{ localeStore.t('auth.login') }}
            </v-btn>

            <p class="text-caption text-center text-medium-emphasis mb-0">
              {{ localeStore.t('auth.hint') }}
            </p>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true

  const success = authStore.loginUI(username.value, password.value)

  if (success) {
    await router.push('/media')
  }

  loading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 60%),
    linear-gradient(135deg, var(--blue-50), var(--slate-100));
  padding: clamp(1.5rem, 4vw, 3rem) 1rem;
}
</style>
