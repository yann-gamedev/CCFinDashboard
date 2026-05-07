<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import { useToast } from './composables/useToast'
import ToastContainer from './components/ToastContainer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { LayoutDashboard, CreditCard, Bitcoin, Settings, Sun, Moon, LogOut, LogIn } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const toast = useToast()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Transaksi', to: '/transactions', icon: CreditCard },
  { label: 'Kripto', to: '/crypto', icon: Bitcoin },
  { label: 'Pengaturan', to: '/settings', icon: Settings },
]

const isActive = (path: string) => computed(() => route.path === path)
const isAuthPage = computed(() => route.path === '/auth' || route.path === '/auth/callback')

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}

// Handle Supabase auth errors/callbacks in URL hash
onMounted(async () => {
  const hash = window.location.hash
  
  if (hash && hash.includes('error=')) {
    // Parse error from hash (e.g. #error=access_denied&error_code=otp_expired...)
    const params = new URLSearchParams(hash.substring(1))
    const errorCode = params.get('error_code')
    const errorDesc = params.get('error_description')?.replace(/\+/g, ' ')

    console.warn('[Auth] Hash error detected:', errorCode, errorDesc)

    // Clean up the URL hash
    window.history.replaceState(null, '', window.location.pathname)

    // Sign out any corrupt session
    try {
      await authStore.logout()
    } catch { /* ignore */ }

    // Show user-friendly message
    if (errorCode === 'otp_expired') {
      toast.warning('Link email sudah kadaluarsa. Silakan login ulang.')
    } else {
      toast.error(errorDesc || 'Terjadi kesalahan autentikasi.')
    }

    // Redirect to auth page
    router.replace('/auth')
  }
})
</script>

<template>
  <!-- Loading State -->
  <div v-if="authStore.isLoading" class="min-h-screen bg-slate-950 flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <!-- Auth Page: full-screen, no sidebar -->
  <div v-else-if="isAuthPage">
    <ToastContainer />
    <RouterView />
  </div>

  <!-- Main App: sidebar + content -->
  <div v-else class="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-300">
    <ToastContainer />

    <!-- Desktop Sidebar -->
    <aside class="w-64 bg-slate-900 dark:bg-slate-950 text-white p-6 hidden md:flex flex-col border-r border-slate-800">
      <h2 class="text-2xl font-bold mb-8 italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CCFin.</h2>
      <nav class="space-y-2 flex-1" aria-label="Navigasi utama">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-sm font-medium',
            isActive(item.to).value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-400 hover:bg-slate-800 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Dark Mode Toggle -->
      <button @click="themeStore.toggle()"
              aria-label="Toggle dark mode"
              class="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800 hover:text-white transition-all duration-200 mb-3">
        <Sun v-if="themeStore.isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
        <span>{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <!-- User Info -->
      <div class="pt-4 border-t border-slate-700 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {{ authStore.displayName?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ authStore.displayName }}</p>
            <p class="text-xs text-slate-400">{{ authStore.isAuthenticated ? 'Online' : 'Mode Tamu' }}</p>
          </div>
        </div>
        <button v-if="authStore.isAuthenticated" @click="handleLogout"
                class="w-full text-left flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors p-1">
          <LogOut class="w-4 h-4" /> Keluar
        </button>
        <RouterLink v-else-if="authStore.isGuest" to="/auth"
                    class="block w-full text-left flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors p-1">
          <LogIn class="w-4 h-4" /> Login / Daftar
        </RouterLink>
        <p class="text-xs text-slate-500">CCFin v3.0</p>
      </div>
    </aside>

    <!-- Mobile Bottom Tab Bar -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around safe-bottom">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]"
        :class="isActive(item.to).value
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-slate-400 dark:text-slate-500'"
      >
        <component :is="item.icon" class="w-6 h-6 mb-1" />
        <span class="text-[10px] font-semibold">{{ item.label }}</span>
        <div v-if="isActive(item.to).value" class="w-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5"></div>
      </RouterLink>
      <button @click="themeStore.toggle()"
              class="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-400 dark:text-slate-500 min-w-[60px]">
        <Sun v-if="themeStore.isDark" class="w-6 h-6 mb-1" />
        <Moon v-else class="w-6 h-6 mb-1" />
        <span class="text-[10px] font-semibold">Tema</span>
      </button>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 pb-20 md:pb-8" role="main">
      <ErrorBoundary>
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </ErrorBoundary>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Page Transition */
.page-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Safe area for iOS bottom bar */
.safe-bottom {
  padding-bottom: max(0.25rem, env(safe-area-inset-bottom));
}
</style>