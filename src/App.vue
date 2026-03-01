<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useThemeStore } from './stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  { label: 'Transaksi', to: '/transactions', icon: '💳' },
  { label: 'Market Kripto', to: '/crypto', icon: '₿' },
]

const isActive = (path: string) => computed(() => route.path === path)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-300">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 dark:bg-slate-950 text-white p-6 hidden md:flex flex-col border-r border-slate-800">
      <h2 class="text-2xl font-bold mb-8 italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CCFin.</h2>
      <nav class="space-y-2 flex-1">
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
              class="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-slate-800 hover:text-white transition-all duration-200 mb-3">
        <span>{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
        <span>{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <div class="text-xs text-slate-500 pt-4 border-t border-slate-700">
        <p>CCFin v2.0</p>
      </div>
    </aside>

    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <h2 class="text-lg font-bold italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CCFin.</h2>
      <nav class="flex gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            isActive(item.to).value
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          {{ item.label }}
        </RouterLink>
        <button @click="themeStore.toggle()" class="px-2 py-1.5 text-gray-400 hover:text-white">
          {{ themeStore.isDark ? '☀️' : '🌙' }}
        </button>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 md:mt-0 mt-14">
      <RouterView />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>