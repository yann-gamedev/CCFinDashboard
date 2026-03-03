<script setup lang="ts">
defineProps<{
  variant?: 'card' | 'chart' | 'list-item'
}>()
</script>

<template>
  <div class="animate-pulse">
    <!-- Card Skeleton -->
    <div v-if="variant === 'card'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
      <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
      <div class="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>

    <!-- Chart Skeleton -->
    <div v-else-if="variant === 'chart'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
      <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
      <div class="h-[200px] bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
    </div>

    <!-- List Item Skeleton -->
    <div v-else class="flex items-center gap-3 p-3">
      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div class="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div class="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  </div>
</template>
