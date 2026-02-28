<script setup lang="ts">
import { ref } from 'vue'
import { useFinanceStore, type Transaction } from '../stores/finance'

const financeStore = useFinanceStore()

const editingId = ref<string | null>(null)
const editForm = ref({ title: '', amount: 0, type: 'expense' as 'income' | 'expense', category: '', date: '' })

const categories = ['Makanan', 'Transportasi', 'Hiburan', 'Gaji', 'Tagihan', 'Lainnya']

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const startEdit = (trx: Transaction) => {
  editingId.value = trx.id
  editForm.value = { title: trx.title, amount: trx.amount, type: trx.type, category: trx.category, date: trx.date }
}

const saveEdit = () => {
  if (editingId.value) {
    financeStore.editTransaction(editingId.value, editForm.value)
    editingId.value = null
  }
}

const cancelEdit = () => {
  editingId.value = null
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
    <h3 class="text-lg font-bold text-slate-800 mb-4">Riwayat Transaksi</h3>

    <div v-if="financeStore.transactions.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-sm">Belum ada transaksi dicatat.</p>
    </div>

    <div v-else class="space-y-3 overflow-y-auto pr-2 max-h-[450px]">
      <div v-for="trx in financeStore.transactions.slice().reverse()" :key="trx.id"
           class="border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
        
        <!-- Edit Mode -->
        <div v-if="editingId === trx.id" class="p-4 space-y-3 bg-blue-50 rounded-xl border-blue-200">
          <div class="flex gap-2">
            <label class="flex items-center gap-1 text-xs cursor-pointer">
              <input type="radio" v-model="editForm.type" value="expense" class="text-red-500">
              <span>Pengeluaran</span>
            </label>
            <label class="flex items-center gap-1 text-xs cursor-pointer">
              <input type="radio" v-model="editForm.type" value="income" class="text-green-500">
              <span>Pemasukan</span>
            </label>
          </div>
          <input v-model="editForm.title" type="text" placeholder="Judul"
                 class="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div class="grid grid-cols-3 gap-2">
            <input v-model.number="editForm.amount" type="number" placeholder="Nominal"
                   class="p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <select v-model="editForm.category"
                    class="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input v-model="editForm.date" type="date"
                   class="p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex gap-2">
            <button @click="saveEdit" class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
              Simpan
            </button>
            <button @click="cancelEdit" class="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors">
              Batal
            </button>
          </div>
        </div>

        <!-- View Mode -->
        <div v-else class="flex items-center justify-between p-3">
          <div class="flex items-center gap-3">
            <div :class="trx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
                 class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              {{ trx.type === 'income' ? '+' : '-' }}
            </div>
            <div>
              <p class="font-semibold text-slate-800 text-sm">{{ trx.title }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span>{{ trx.category }}</span>
                <span>•</span>
                <span>{{ formatDate(trx.date) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <p :class="trx.type === 'income' ? 'text-green-600' : 'text-red-500'" class="font-bold text-sm">
              {{ trx.type === 'income' ? '+' : '-' }}{{ formatCurrency(trx.amount) }}
            </p>
            
            <!-- Edit Button -->
            <button @click="startEdit(trx)"
                    class="text-slate-400 hover:text-blue-500 transition-colors"
                    title="Edit Transaksi">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>

            <!-- Delete Button -->
            <button @click="financeStore.deleteTransaction(trx.id)"
                    class="text-slate-400 hover:text-red-500 transition-colors"
                    title="Hapus Transaksi">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>