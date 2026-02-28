<script setup lang="ts">
import { useFinanceStore } from '../stores/finance'

const financeStore = useFinanceStore()

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
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
    <h3 class="text-lg font-bold text-slate-800 mb-4">Riwayat Transaksi</h3>

    <div v-if="financeStore.transactions.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-400">
      <p class="text-sm">Belum ada transaksi dicatat.</p>
    </div>

    <div v-else class="space-y-3 overflow-y-auto pr-2 max-h-[350px]">
      <div v-for="trx in financeStore.transactions.slice().reverse()" :key="trx.id" 
           class="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
        
        <div class="flex items-center gap-3">
          <div :class="trx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'" 
               class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
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

        <div class="flex items-center gap-4">
          <p :class="trx.type === 'income' ? 'text-green-600' : 'text-slate-800'" class="font-bold text-sm">
            {{ formatCurrency(trx.amount) }}
          </p>
          
          <button @click="financeStore.deleteTransaction(trx.id)" 
                  class="text-slate-400 hover:text-red-500 transition-colors"
                  title="Hapus Transaksi">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>