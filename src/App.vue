<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useThemeStore } from './stores/theme'
import ToastContainer from './components/ToastContainer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

const route = useRoute()
const themeStore = useThemeStore()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  { label: 'Transaksi', to: '/transactions', icon: '💳' },
  { label: 'Kripto', to: '/crypto', icon: '₿' },
  { label: 'Pengaturan', to: '/settings', icon: '⚙️' },
]

const isActive = (path: string) => computed(() => route.path === path)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-300">
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
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Dark Mode Toggle -->
      <button @click="themeStore.toggle()"
              aria-label="Toggle dark mode"
              class="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800 hover:text-white transition-all duration-200 mb-3">
        <span>{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
        <span>{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <div class="text-xs text-slate-500 pt-4 border-t border-slate-700">
        <p>CCFin v3.0</p>
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
        <span class="text-lg">{{ item.icon }}</span>
        <span class="text-[10px] font-semibold">{{ item.label }}</span>
        <div v-if="isActive(item.to).value" class="w-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5"></div>
      </RouterLink>
      <button @click="themeStore.toggle()"
              class="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-slate-400 dark:text-slate-500 min-w-[60px]">
        <span class="text-lg">{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
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