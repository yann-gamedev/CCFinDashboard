<script setup lang="ts">
import { useFinanceStore } from '../stores/finance'
import AnalyticsChart from '../components/AnalyticsChart.vue'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'

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
  <div>
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

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p class="text-sm text-slate-500 font-medium">Total Saldo</p>
        <p class="text-2xl font-bold mt-1" :class="financeStore.balance >= 0 ? 'text-slate-800' : 'text-red-500'">
          {{ formatCurrency(financeStore.balance) }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p class="text-sm text-green-600 font-medium italic">Pemasukan</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ formatCurrency(financeStore.totalIncome) }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p class="text-sm text-red-500 font-medium italic">Pengeluaran</p>
        <p class="text-2xl font-bold text-red-500 mt-1">{{ formatCurrency(financeStore.totalExpense) }}</p>
      </div>
    </div>

    <!-- Charts & Form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <AnalyticsChart />
      <TransactionForm />
    </div>

    <!-- Transaction List -->
    <TransactionList />
  </div>
</template>
