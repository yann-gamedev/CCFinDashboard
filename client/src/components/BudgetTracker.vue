<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useBudgetStore } from '../stores/budget'
import { CATEGORIES } from '../constants/categories'
import { formatCurrency } from '../utils/format'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import { useCurrencyInput } from '../composables/useCurrencyInput'

const financeStore = useFinanceStore()
const budgetStore = useBudgetStore()
const budgetAmountInput = useCurrencyInput()

const selectedCategory = ref('')

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const getMonthlySpent = (category: string) => {
  const currentMonth = getCurrentMonth()
  return financeStore.transactions
    .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0)
}

const budgetItems = computed(() => {
  return budgetStore.budgets.map(b => {
    const spent = getMonthlySpent(b.category)
    const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0
    return { ...b, spent, percentage, remaining: b.limit - spent }
  })
})

const currentMonthLabel = computed(() => {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const addBudget = () => {
  if (!selectedCategory.value || !budgetAmountInput.rawValue.value) return
  budgetStore.setBudget(selectedCategory.value, budgetAmountInput.rawValue.value)
  selectedCategory.value = ''
  budgetAmountInput.reset()
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-slate-800 dark:text-white">Anggaran Bulanan</h3>
      <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ currentMonthLabel }}</span>
    </div>

    <!-- Add Budget Form -->
    <div class="flex gap-2 mb-6">
      <select v-model="selectedCategory"
              class="flex-1 p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option disabled value="">Pilih Kategori...</option>
        <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <input type="text" inputmode="numeric"
             :value="budgetAmountInput.displayValue.value"
             @input="budgetAmountInput.onInput"
             placeholder="500.000"
             class="w-32 p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      <button @click="addBudget"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
        + Set
      </button>
    </div>

    <!-- Budget List -->
    <div v-if="budgetItems.length === 0" class="text-center text-slate-400 dark:text-slate-500 py-6 text-sm">
      <p>Belum ada anggaran diatur.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in budgetItems" :key="item.category" class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ item.category }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatCurrency(item.spent) }} / {{ formatCurrency(item.limit) }}
            </span>
            <button @click="budgetStore.removeBudget(item.category)"
                    class="text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500"
               :class="item.percentage >= 90 ? 'bg-red-500' : item.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'"
               :style="{ width: item.percentage + '%' }">
          </div>
        </div>
        <p v-if="item.remaining < 0" class="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertTriangle class="w-3.5 h-3.5" /> Over budget {{ formatCurrency(Math.abs(item.remaining)) }}
        </p>
        <p v-else class="text-xs text-slate-400 dark:text-slate-500">
          Sisa: {{ formatCurrency(item.remaining) }}
        </p>
      </div>
    </div>
  </div>
</template>
