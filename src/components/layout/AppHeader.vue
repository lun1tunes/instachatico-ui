<template>
  <header class="app-header">
    <div class="container">
      <div class="app-header__content">
        <router-link to="/" class="app-header__logo">
          <svg
            width="32"
            height="32"
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
          <span class="app-header__title">Instachatico</span>
        </router-link>

        <nav class="app-header__nav">
          <router-link
            to="/media"
            class="app-header__nav-link"
            active-class="app-header__nav-link--active"
          >
            Media
          </router-link>
        </nav>

        <div class="app-header__actions">
          <BaseButton v-if="authStore.isAuthenticated" variant="ghost" size="sm" @click="handleLogout">
            Logout
          </BaseButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background-color: white;
  border-bottom: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  gap: var(--spacing-lg);
}

.app-header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: var(--navy-900);
  transition: opacity var(--transition-fast);
}

.app-header__logo:hover {
  opacity: 0.8;
}

.app-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--blue-500), var(--navy-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.app-header__nav-link {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  color: var(--navy-600);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.app-header__nav-link:hover {
  background-color: var(--slate-100);
  color: var(--navy-900);
}

.app-header__nav-link--active {
  background-color: var(--blue-50);
  color: var(--blue-500);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
</style>
