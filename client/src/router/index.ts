import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: { public: true },
    },
    {
      // Handle Supabase email confirmation callback
      path: '/auth/callback',
      name: 'auth-callback',
      meta: { public: true },
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionsView.vue'),
    },
    {
      path: '/crypto',
      name: 'crypto',
      component: () => import('../views/CryptoView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { public: true },
    },
  ],
})

// Cache the session check to avoid calling getSession() on every navigation
let cachedSession: boolean | null = null

supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = !!session
})

// Navigation guard
router.beforeEach(async (to) => {
  if (to.meta.public) return true

  // First navigation: check session from Supabase
  if (cachedSession === null) {
    try {
      const { data } = await supabase.auth.getSession()
      cachedSession = !!data.session
    } catch {
      cachedSession = false
    }
  }

  const isGuest = localStorage.getItem('ccfin-guest') === 'true'

  if (!cachedSession && !isGuest) {
    return { name: 'auth' }
  }

  return true
})

export default router

