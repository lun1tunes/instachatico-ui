<template>
  <div class="login-page">
    <div class="login-container">
      <BaseCard padding="lg" shadow="lg">
        <div class="login-header">
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path
              d="M16 10L20 14H18V20H14V14H12L16 10Z"
              fill="white"
              opacity="0.9"
            />
            <defs>
              <linearGradient
                id="gradient"
                x1="0"
                y1="0"
                x2="32"
                y2="32"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#3B82F6" />
                <stop offset="1" stop-color="#1E40AF" />
              </linearGradient>
            </defs>
          </svg>
          <h1>Instachatico</h1>
          <p class="login-subtitle">Comment Bot Moderator</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
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
            Login
          </BaseButton>

          <p class="login-hint">
            Default credentials: admin / admin123
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

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true

  // Login to UI (validates username/password)
  const success = authStore.loginUI(username.value, password.value)

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

.login-header svg {
  margin-bottom: var(--spacing-md);
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
