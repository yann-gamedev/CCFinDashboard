<script setup lang="ts">
import { useFinanceStore } from './stores/finance'
import TransactionForm from './components/TransactionForm.vue'
import TransactionList from './components/TransactionList.vue'

const financeStore = useFinanceStore()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    
    <aside class="w-64 bg-slate-900 text-white p-6 hidden md:block">
      <h2 class="text-2xl font-bold mb-8 italic">CCFin.</h2>
      <nav class="space-y-4">
        <a href="#" class="block p-3 bg-blue-600 rounded-lg">Dashboard</a>
        <a href="#" class="block p-3 hover:bg-slate-800 rounded-lg text-gray-400">Transaksi</a>
        <a href="#" class="block p-3 hover:bg-slate-800 rounded-lg text-gray-400">Market Kripto</a>
      </nav>
    </aside>

    
    <main class="flex-1 p-4 md:p-8">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dashboard Keuangan</h1>
          <p class="text-slate-500 text-sm">Pantau arus kas kamu secara real-time.</p>
        </div>
        <div class="bg-white p-2 rounded-full shadow-sm">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            C
          </div>
        </div>
      </header>

      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p class="text-sm text-slate-500 font-medium">Total Saldo</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">{{ formatCurrency(financeStore.balance) }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p class="text-sm text-green-600 font-medium italic">Pemasukan</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">{{ formatCurrency(financeStore.totalIncome) }}</p>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p class="text-sm text-red-500 font-medium italic">Pengeluaran</p>
          <p class="text-2xl font-bold text-slate-800 mt-1 text-red-500">{{ formatCurrency(financeStore.totalExpense) }}</p>
        </div>
      </div>

      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TransactionForm />
        <TransactionList />
      </div>
    </main>
  </div>
</template>

<style>

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>