<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useRecurringStore } from '../stores/recurring'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import { useToast } from '../composables/useToast'
import { useCountUp } from '../composables/useCountUp'
import { formatCurrency } from '../utils/format'
import AnalyticsChart from '../components/AnalyticsChart.vue'
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'
import BudgetTracker from '../components/BudgetTracker.vue'
import MonthlyTrendChart from '../components/MonthlyTrendChart.vue'
import RecurringManager from '../components/RecurringManager.vue'

const financeStore = useFinanceStore()
const recurringStore = useRecurringStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const toast = useToast()

const greeting = computed(() => {
  const hour = new Date().getHours()
  const name = settingsStore.settings.username || authStore.displayName
  const timeGreeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam'
  return name ? `${timeGreeting}, ${name}` : timeGreeting
})

// Animated counters
const animBalance = useCountUp(() => financeStore.balance)
const animIncome = useCountUp(() => financeStore.totalIncome)
const animExpense = useCountUp(() => financeStore.totalExpense)

// Process recurring on mount
onMounted(() => {
  const created = recurringStore.processRecurring()
  if (created > 0) {
    toast.info(`${created} transaksi berulang otomatis dibuat.`)
  }
})

// Auto-sync to cloud when data changes (debounced)
let syncTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => financeStore.transactions.length, () => {
  if (!authStore.isAuthenticated) return
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    authStore.syncToCloud().catch(() => {})
  }, 3000)
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
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 card-entrance" style="--delay: 0">
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Saldo</p>
        <p class="text-2xl font-bold mt-1" :class="financeStore.balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-500'">
          {{ formatCurrency(animBalance) }}
        </p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 card-entrance" style="--delay: 1">
        <p class="text-sm text-green-600 dark:text-green-400 font-medium italic">Pemasukan</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ formatCurrency(animIncome) }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 card-entrance" style="--delay: 2">
        <p class="text-sm text-red-500 dark:text-red-400 font-medium italic">Pengeluaran</p>
        <p class="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{{ formatCurrency(animExpense) }}</p>
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

    <!-- Budget, Recurring & Transaction List -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <BudgetTracker />
      <RecurringManager />
    </div>

    <TransactionList />
  </div>
</template>

<style scoped>
.card-entrance {
  animation: cardFadeUp 0.5s ease-out both;
  animation-delay: calc(var(--delay, 0) * 0.1s);
}

@keyframes cardFadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
