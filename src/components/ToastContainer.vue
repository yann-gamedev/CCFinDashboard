<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts } = useToast()

const typeStyles: Record<string, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
}

const typeIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[999] space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id"
             :class="typeStyles[toast.type]"
             class="px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-auto min-w-[250px] max-w-[400px]">
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">
            {{ typeIcons[toast.type] }}
          </span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
