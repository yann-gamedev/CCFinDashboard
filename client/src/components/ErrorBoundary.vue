<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { AlertOctagon, RefreshCw } from 'lucide-vue-next'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : 'Unknown error'
  return false // prevent propagation
})

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <div v-if="hasError" class="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
    <AlertOctagon class="w-16 h-16 text-red-500 mb-4" />
    <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Terjadi Kesalahan</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Ada yang tidak beres dengan aplikasi.</p>
    <p class="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg max-w-md truncate">
      {{ errorMessage }}
    </p>
    <button @click="reload"
            class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
      <RefreshCw class="w-4 h-4" /> Muat Ulang
    </button>
  </div>
  <slot v-else />
</template>
