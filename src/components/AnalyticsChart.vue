<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { useFinanceStore } from '../stores/finance'
import { formatCompactNumber } from '../utils/format'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const financeStore = useFinanceStore()
const themeStore = useThemeStore()

const hasData = computed(() => financeStore.transactions.length > 0)

// Doughnut: Income vs Expense
const doughnutData = computed(() => ({
  labels: ['Pemasukan', 'Pengeluaran'],
  datasets: [{
    data: [financeStore.totalIncome, financeStore.totalExpense],
    backgroundColor: ['#22c55e', '#ef4444'],
    borderWidth: 0,
    hoverOffset: 8,
  }],
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        font: { family: 'Plus Jakarta Sans', size: 12 },
        color: themeStore.isDark ? '#94a3b8' : '#64748b',
      },
    },
  },
  cutout: '65%',
}))

// Bar: Spending by category
const barData = computed(() => {
  const categoryMap = new Map<string, { income: number; expense: number }>()
  
  financeStore.transactions.forEach(t => {
    const existing = categoryMap.get(t.category) || { income: 0, expense: 0 }
    if (t.type === 'income') {
      existing.income += t.amount
    } else {
      existing.expense += t.amount
    }
    categoryMap.set(t.category, existing)
  })

  const labels = Array.from(categoryMap.keys())
  const incomeData = labels.map(l => categoryMap.get(l)?.income || 0)
  const expenseData = labels.map(l => categoryMap.get(l)?.expense || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Pemasukan',
        data: incomeData,
        backgroundColor: '#22c55e',
        borderRadius: 6,
      },
      {
        label: 'Pengeluaran',
        data: expenseData,
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  }
})

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        font: { family: 'Plus Jakarta Sans', size: 12 },
        color: themeStore.isDark ? '#94a3b8' : '#64748b',
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 11 },
        color: themeStore.isDark ? '#94a3b8' : '#64748b',
      },
    },
    y: {
      grid: { color: themeStore.isDark ? '#334155' : '#f1f5f9' },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 11 },
        color: themeStore.isDark ? '#94a3b8' : '#64748b',
        callback: (value: number | string) => {
          const num = typeof value === 'string' ? parseFloat(value) : value
          return formatCompactNumber(num)
        },
      },
    },
  },
}))
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Analitik</h3>

    <div v-if="!hasData" class="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
      <p>Tambahkan transaksi untuk melihat grafik.</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Doughnut Chart -->
      <div>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Pemasukan vs Pengeluaran</p>
        <div class="h-[200px]">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>

      <!-- Bar Chart -->
      <div>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Per Kategori</p>
        <div class="h-[200px]">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
