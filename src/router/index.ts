import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/media'
  },
  {
    path: '/media',
    name: 'MediaList',
    component: () => import('@/views/MediaList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/comments',
    name: 'Comments',
    component: () => import('@/views/Comments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/media/:id',
    name: 'MediaDetail',
    component: () => import('@/views/MediaDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'MediaList' })
  } else {
    next()
  }
})

export default router
