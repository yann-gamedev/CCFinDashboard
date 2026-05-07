<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useToast } from '../composables/useToast'
import { CATEGORIES } from '../constants/categories'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'
import { Search, X, Download } from 'lucide-vue-next'

const financeStore = useFinanceStore()
const toast = useToast()

// Filters
const searchQuery = ref('')
const filterType = ref<'' | 'income' | 'expense'>('')
const filterCategory = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter(t => {
    const matchSearch = !searchQuery.value || t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = !filterType.value || t.type === filterType.value
    const matchCategory = !filterCategory.value || t.category === filterCategory.value
    const matchDateFrom = !dateFrom.value || t.date >= dateFrom.value
    const matchDateTo = !dateTo.value || t.date <= dateTo.value
    return matchSearch && matchType && matchCategory && matchDateFrom && matchDateTo
  })
})

const clearFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterCategory.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

const hasActiveFilters = computed(() =>
  searchQuery.value || filterType.value || filterCategory.value || dateFrom.value || dateTo.value
)

// CSV Export (with proper escaping)
const exportCSV = () => {
  const data = hasActiveFilters.value ? filteredTransactions.value : financeStore.transactions
  if (data.length === 0) return

  const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`

  const headers = ['Tanggal', 'Judul', 'Kategori', 'Tipe', 'Nominal']
  const rows = data.map(t => [
    t.date,
    escapeCSV(t.title),
    escapeCSV(t.category),
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.amount.toString()
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ccfin-transaksi-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)

  toast.success(`${data.length} transaksi berhasil di-export!`)
}
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Transaksi</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm">Kelola semua transaksi keuanganmu.</p>
      </div>
      <button @click="exportCSV"
              :disabled="financeStore.transactions.length === 0"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
        <Download class="h-4 w-4" />
        Export CSV
      </button>
    </header>

    <!-- Search & Filter Bar -->
    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
      <div class="flex flex-wrap gap-3 items-center">
        <!-- Search -->
        <div class="flex-1 min-w-[180px] relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input v-model="searchQuery" type="text" placeholder="Cari transaksi..."
                 class="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <!-- Type Filter -->
        <select v-model="filterType"
                class="p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <!-- Category Filter -->
        <select v-model="filterCategory"
                class="p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Kategori</option>
          <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <!-- Clear Filters -->
        <button v-if="hasActiveFilters" @click="clearFilters"
                class="flex items-center gap-1 px-3 py-2.5 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors">
          <X class="h-4 w-4" /> Reset
        </button>
      </div>
      <!-- Date Range -->
      <div class="flex flex-wrap gap-3 items-center mt-3">
        <label class="text-xs text-slate-500 dark:text-slate-400 font-medium">Dari:</label>
        <input v-model="dateFrom" type="date"
               class="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <label class="text-xs text-slate-500 dark:text-slate-400 font-medium">Sampai:</label>
        <input v-model="dateTo" type="date"
               class="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
      <p v-if="hasActiveFilters" class="text-xs text-slate-400 dark:text-slate-500 mt-2">
        Menampilkan {{ filteredTransactions.length }} dari {{ financeStore.transactions.length }} transaksi
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1">
        <TransactionForm />
      </div>
      <div class="lg:col-span-2">
        <TransactionList :filtered-transactions="hasActiveFilters ? filteredTransactions : undefined" />
      </div>
    </div>
  </div>
</template>
