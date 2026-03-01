<script setup lang="ts">
import { computed } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { formatCurrency } from '../utils/format'
import AnalyticsChart from '../components/AnalyticsChart.vue'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'
import BudgetTracker from '../components/BudgetTracker.vue'
import MonthlyTrendChart from '../components/MonthlyTrendChart.vue'

const financeStore = useFinanceStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 17) return 'Selamat Siang'
  return 'Selamat Malam'
})
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Keuangan</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm">{{ greeting }}! Pantau arus kas kamu secara real-time.</p>
      </div>
    </header>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Saldo</p>
        <p class="text-2xl font-bold mt-1" :class="financeStore.balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-500'">
          {{ formatCurrency(financeStore.balance) }}
        </p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p class="text-sm text-green-600 dark:text-green-400 font-medium italic">Pemasukan</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ formatCurrency(financeStore.totalIncome) }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p class="text-sm text-red-500 dark:text-red-400 font-medium italic">Pengeluaran</p>
        <p class="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{{ formatCurrency(financeStore.totalExpense) }}</p>
      </div>
    </div>

    <!-- Monthly Trend Chart -->
    <div class="mb-8">
      <MonthlyTrendChart />
    </div>

    <!-- Charts & Form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <AnalyticsChart />
      <TransactionForm />
    </div>

    <!-- Budget & Transaction List -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BudgetTracker />
      <TransactionList />
    </div>
  </div>
</template>
