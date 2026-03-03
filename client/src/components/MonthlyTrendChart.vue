<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFinanceStore } from '../stores/finance'
import { useThemeStore } from '../stores/theme'
import { formatCompactNumber } from '../utils/format'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const financeStore = useFinanceStore()
const themeStore = useThemeStore()

const hasData = computed(() => financeStore.transactions.length > 0)

const chartData = computed(() => {
  // Group by month
  const monthMap = new Map<string, { income: number; expense: number }>()

  financeStore.transactions.forEach(t => {
    const month = t.date.substring(0, 7) // "YYYY-MM"
    const existing = monthMap.get(month) || { income: 0, expense: 0 }
    if (t.type === 'income') {
      existing.income += t.amount
    } else {
      existing.expense += t.amount
    }
    monthMap.set(month, existing)
  })

  // Sort by month
  const sorted = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  
  // Format month labels
  const labels = sorted.map(([m]) => {
    const parts = m.split('-')
    const year = parts[0] ?? '2026'
    const month = parts[1] ?? '01'
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'Pemasukan',
        data: sorted.map(([, v]) => v.income),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Pengeluaran',
        data: sorted.map(([, v]) => v.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
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
    tooltip: {
      backgroundColor: themeStore.isDark ? '#1e293b' : '#fff',
      titleColor: themeStore.isDark ? '#f1f5f9' : '#1e293b',
      bodyColor: themeStore.isDark ? '#94a3b8' : '#64748b',
      borderColor: themeStore.isDark ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
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
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Tren Bulanan</h3>

    <div v-if="!hasData" class="h-[200px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
      <p>Tambahkan transaksi untuk melihat tren.</p>
    </div>

    <div v-else class="h-[250px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
