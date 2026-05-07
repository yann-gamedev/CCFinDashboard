<script setup lang="ts">
import { Search, ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <Search class="w-16 h-16 text-slate-400 mb-4" />
    <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">404</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-6">Halaman tidak ditemukan.</p>
    <RouterLink to="/dashboard"
                class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
      <ArrowLeft class="w-4 h-4" /> Kembali ke Dashboard
    </RouterLink>
  </div>
</template>
