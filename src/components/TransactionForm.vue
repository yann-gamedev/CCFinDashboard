<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore } from '../stores/finance'

const financeStore = useFinanceStore()

const title = ref('')
const amount = ref<number | null>(null)
const type = ref<'income' | 'expense'>('expense')
const category = ref('')
const date = ref(new Date().toISOString().split('T')[0])

const categories = ['Makanan', 'Transportasi', 'Hiburan', 'Gaji', 'Tagihan', 'Lainnya']

const submitTransaction = () => {
  if (!title.value || !amount.value || !category.value || !date.value) {
    alert('Mohon lengkapi semua data!')
    return
  }

  financeStore.addTransaction({
    id: crypto.randomUUID(),
    title: title.value,
    amount: amount.value,
    type: type.value,
    category: category.value,
    date: date.value
  })

  title.value = ''
  amount.value = null
  category.value = ''
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Tambah Transaksi</h3>
    
    <form @submit.prevent="submitTransaction" class="space-y-4">
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" v-model="type" value="expense" class="text-red-500 focus:ring-red-500">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Pengeluaran</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" v-model="type" value="income" class="text-green-500 focus:ring-green-500">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Pemasukan</span>
        </label>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Judul / Catatan</label>
        <input type="text" v-model="title" placeholder="Cth: Beli Kopi" 
               class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white">
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nominal (Rp)</label>
          <input type="number" v-model="amount" placeholder="50000" 
                 class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
          <select v-model="category" class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white">
            <option disabled value="">Pilih...</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tanggal</label>
        <input type="date" v-model="date" 
               class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white">
      </div>

      <button type="submit" 
              class="w-full mt-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
        Simpan Transaksi
      </button>
    </form>
  </div>
</template>