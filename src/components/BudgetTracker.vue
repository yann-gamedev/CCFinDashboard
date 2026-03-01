<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useBudgetStore } from '../stores/budget'

const financeStore = useFinanceStore()
const budgetStore = useBudgetStore()

const categories = ['Makanan', 'Transportasi', 'Hiburan', 'Gaji', 'Tagihan', 'Lainnya']

const selectedCategory = ref('')
const budgetAmount = ref<number | null>(null)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

const getSpent = (category: string) => {
  return financeStore.transactions
    .filter(t => t.type === 'expense' && t.category === category)
    .reduce((sum, t) => sum + t.amount, 0)
}

const budgetItems = computed(() => {
  return budgetStore.budgets.map(b => {
    const spent = getSpent(b.category)
    const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0
    return { ...b, spent, percentage, remaining: b.limit - spent }
  })
})

const addBudget = () => {
  if (!selectedCategory.value || !budgetAmount.value) return
  budgetStore.setBudget(selectedCategory.value, budgetAmount.value)
  selectedCategory.value = ''
  budgetAmount.value = null
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Anggaran Bulanan</h3>

    <!-- Add Budget Form -->
    <div class="flex gap-2 mb-6">
      <select v-model="selectedCategory"
              class="flex-1 p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option disabled value="">Pilih Kategori...</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <input v-model.number="budgetAmount" type="number" placeholder="Limit (Rp)"
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
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
        <p v-if="item.remaining < 0" class="text-xs text-red-500 font-medium">
          ⚠️ Over budget {{ formatCurrency(Math.abs(item.remaining)) }}
        </p>
        <p v-else class="text-xs text-slate-400 dark:text-slate-500">
          Sisa: {{ formatCurrency(item.remaining) }}
        </p>
      </div>
    </div>
  </div>
</template>
