<script setup lang="ts">
import { ref } from 'vue'
import { useRecurringStore, type RecurringTransaction } from '../stores/recurring'
import { useToast } from '../composables/useToast'
import { CATEGORIES } from '../constants/categories'
import { formatCurrency } from '../utils/format'

const recurringStore = useRecurringStore()
const toast = useToast()

const showForm = ref(false)
const form = ref({
  title: '',
  amount: null as number | null,
  type: 'expense' as 'income' | 'expense',
  category: '',
  frequency: 'monthly' as 'monthly' | 'weekly',
  nextDate: new Date().toISOString().split('T')[0],
})

const addItem = () => {
  if (!form.value.title || !form.value.amount || !form.value.category) {
    toast.warning('Lengkapi semua data!')
    return
  }

  recurringStore.addRecurring({
    id: crypto.randomUUID(),
    title: form.value.title.trim(),
    amount: form.value.amount,
    type: form.value.type,
    category: form.value.category,
    frequency: form.value.frequency,
    nextDate: form.value.nextDate,
    enabled: true,
  })

  toast.success(`Transaksi berulang "${form.value.title}" ditambahkan!`)
  form.value = { title: '', amount: null, type: 'expense', category: '', frequency: 'monthly', nextDate: new Date().toISOString().split('T')[0] }
  showForm.value = false
}

const formatFreq = (f: string) => f === 'monthly' ? 'Bulanan' : 'Mingguan'

const confirmDeleteId = ref<string | null>(null)

const removeItem = (id: string) => {
  recurringStore.removeRecurring(id)
  toast.success('Transaksi berulang dihapus.')
  confirmDeleteId.value = null
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-slate-800 dark:text-white">Transaksi Berulang</h3>
      <button @click="showForm = !showForm"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              :class="showForm ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'">
        {{ showForm ? '✕ Tutup' : '+ Tambah' }}
      </button>
    </div>

    <!-- Add Form -->
    <div v-if="showForm" class="space-y-3 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
      <div class="flex gap-3">
        <label class="flex items-center gap-1 text-xs cursor-pointer dark:text-slate-300">
          <input type="radio" v-model="form.type" value="expense" class="text-red-500">
          <span>Pengeluaran</span>
        </label>
        <label class="flex items-center gap-1 text-xs cursor-pointer dark:text-slate-300">
          <input type="radio" v-model="form.type" value="income" class="text-green-500">
          <span>Pemasukan</span>
        </label>
      </div>
      <input v-model="form.title" type="text" placeholder="Judul (cth: Sewa Kos)"
             class="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div class="grid grid-cols-2 gap-2">
        <input v-model.number="form.amount" type="number" placeholder="Nominal" min="1"
               class="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <select v-model="form.category"
                class="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option disabled value="">Kategori...</option>
          <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <select v-model="form.frequency"
                class="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="monthly">Bulanan</option>
          <option value="weekly">Mingguan</option>
        </select>
        <input v-model="form.nextDate" type="date"
               class="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <button @click="addItem" class="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        Simpan Berulang
      </button>
    </div>

    <!-- List -->
    <div v-if="recurringStore.items.length === 0 && !showForm" class="text-center text-slate-400 dark:text-slate-500 py-6 text-sm">
      <p>Belum ada transaksi berulang.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in recurringStore.items" :key="item.id"
           class="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl"
           :class="item.enabled ? '' : 'opacity-50'">
        
        <!-- Delete Confirmation -->
        <template v-if="confirmDeleteId === item.id">
          <p class="text-sm text-red-500 font-medium">Hapus?</p>
          <div class="flex gap-2">
            <button @click="removeItem(item.id)" class="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">Ya</button>
            <button @click="confirmDeleteId = null" class="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs">Batal</button>
          </div>
        </template>

        <!-- Normal View -->
        <template v-else>
          <div class="flex items-center gap-3">
            <button @click="recurringStore.toggleEnabled(item.id)"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-colors"
                    :class="item.enabled
                      ? (item.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500')
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'"
                    :title="item.enabled ? 'Nonaktifkan' : 'Aktifkan'">
              {{ item.type === 'income' ? '↻' : '↻' }}
            </button>
            <div>
              <p class="font-semibold text-slate-800 dark:text-white text-sm">{{ item.title }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ formatFreq(item.frequency) }} • {{ item.category }} • Next: {{ item.nextDate }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span :class="item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'" class="font-bold text-sm">
              {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
            </span>
            <button @click="confirmDeleteId = item.id" class="text-slate-400 hover:text-red-500 transition-colors" title="Hapus">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
