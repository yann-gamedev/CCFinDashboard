<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  { label: 'Transaksi', to: '/transactions', icon: '💳' },
]

const isActive = (path: string) => computed(() => route.path === path)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
      <h2 class="text-2xl font-bold mb-8 italic">CCFin.</h2>
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
      <div class="text-xs text-slate-500 pt-4 border-t border-slate-700">
        <p>CCFin v1.0</p>
      </div>
    </aside>

    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <h2 class="text-lg font-bold italic">CCFin.</h2>
      <nav class="flex gap-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            isActive(item.to).value
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          {{ item.label }}
        </RouterLink>
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