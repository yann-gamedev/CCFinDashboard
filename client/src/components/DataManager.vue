<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-vue-next'

const toast = useToast()

// Export full backup
const exportBackup = () => {
  const backup: Record<string, string | null> = {}
  const keys = ['ccfin-transactions', 'ccfin-budgets', 'ccfin-recurring', 'ccfin-settings', 'ccfin-theme']
  keys.forEach(k => { backup[k] = localStorage.getItem(k) })

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ccfin-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)

  toast.success('Backup berhasil di-download!')
}

// Import backup
const fileInput = ref<HTMLInputElement | null>(null)

const importBackup = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target?.result as string)

      // Validate keys
      const validKeys = ['ccfin-transactions', 'ccfin-budgets', 'ccfin-recurring', 'ccfin-settings', 'ccfin-theme']
      const hasValidKeys = Object.keys(backup).some(k => validKeys.includes(k))
      if (!hasValidKeys) {
        toast.error('File backup tidak valid!')
        return
      }

      // Restore
      Object.entries(backup).forEach(([key, value]) => {
        if (validKeys.includes(key) && value !== null) {
          localStorage.setItem(key, value as string)
        }
      })

      toast.success('Backup berhasil di-restore! Memuat ulang...')
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      toast.error('Gagal membaca file backup.')
    }
  }
  reader.readAsText(file)
}

// Clear all data
const clearConfirm = ref('')
const showClearDialog = ref(false)

const clearAllData = () => {
  if (clearConfirm.value !== 'HAPUS') {
    toast.warning('Ketik "HAPUS" untuk konfirmasi.')
    return
  }

  const keys = ['ccfin-transactions', 'ccfin-budgets', 'ccfin-recurring', 'ccfin-settings']
  keys.forEach(k => localStorage.removeItem(k))

  toast.success('Semua data berhasil dihapus! Memuat ulang...')
  clearConfirm.value = ''
  showClearDialog.value = false
  setTimeout(() => window.location.reload(), 1500)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Export / Import -->
    <div class="flex flex-wrap gap-3">
      <button @click="exportBackup"
              class="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
        <Download class="h-4 w-4" />
        Export Backup
      </button>
      <button @click="importBackup"
              class="px-4 py-2.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center gap-2">
        <Upload class="h-4 w-4" />
        Import Backup
      </button>
      <input ref="fileInput" type="file" accept=".json" @change="handleFileImport" class="hidden">
    </div>

    <!-- Clear All Data -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
      <button v-if="!showClearDialog" @click="showClearDialog = true"
              class="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
        <Trash2 class="w-4 h-4" /> Hapus Semua Data
      </button>
      <div v-else class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl space-y-3">
        <p class="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
          <AlertTriangle class="w-4 h-4" /> Ketik "HAPUS" untuk menghapus semua data secara permanen.
        </p>
        <div class="flex gap-2">
          <input v-model="clearConfirm" type="text" placeholder='Ketik "HAPUS"'
                 class="flex-1 p-2 border border-red-300 dark:border-red-800 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <button @click="clearAllData" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
            Konfirmasi
          </button>
          <button @click="showClearDialog = false; clearConfirm = ''" class="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
