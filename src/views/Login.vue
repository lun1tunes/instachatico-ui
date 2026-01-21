<template>
  <div class="login-page">
    <div class="login-container">
      <BaseCard padding="lg" shadow="lg">
        <div class="login-header">
          <img class="login-icon" :src="appIconSrc" alt="" aria-hidden="true" />
          <h1>{{ localeStore.t('auth.title') }}</h1>
          <p class="login-subtitle">{{ localeStore.t('auth.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">{{ localeStore.t('auth.username') }}</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              :placeholder="localeStore.t('auth.usernamePlaceholder')"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">{{ localeStore.t('auth.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              :placeholder="localeStore.t('auth.passwordPlaceholder')"
              required
              autocomplete="current-password"
            />
          </div>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :loading="loading"
          >
            {{ localeStore.t('auth.login') }}
          </BaseButton>

          <p class="login-hint">
            {{ localeStore.t('auth.hint') }}
          </p>
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useLocaleStore } from '@/stores/locale'

const router = useRouter()
const authStore = useAuthStore()
const localeStore = useLocaleStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const publicBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const appIconSrc = `${publicBase}/assets/instachatico_icon.png`

async function handleLogin() {
  loading.value = true

  const success = await authStore.login(username.value, password.value)

  if (success) {
    // Redirect to media page
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
  justify-content: center;
  background: linear-gradient(135deg, var(--blue-50) 0%, var(--slate-100) 100%);
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-icon {
  width: 56px;
  height: 56px;
  margin-bottom: var(--spacing-md);
  border-radius: 14px;
  object-fit: contain;
  box-shadow: var(--shadow-md);
  background: white;
}

.login-header h1 {
  background: linear-gradient(135deg, var(--blue-500), var(--navy-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  color: var(--navy-600);
  font-size: 0.875rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--navy-700);
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: var(--font-sans);
  color: var(--navy-800);
  background-color: white;
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}

.form-input::placeholder {
  color: var(--slate-400);
}

.error-message {
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.login-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--slate-500);
  margin: 0;
  font-style: italic;
}
</style>
