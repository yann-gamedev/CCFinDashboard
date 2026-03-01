import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const BUDGET_KEY = 'ccfin-budgets'

export interface Budget {
    category: string
    limit: number
}

function loadBudgets(): Budget[] {
    try {
        const data = localStorage.getItem(BUDGET_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

export const useBudgetStore = defineStore('budget', () => {
    const budgets = ref<Budget[]>(loadBudgets())

    watch(budgets, (val) => {
        localStorage.setItem(BUDGET_KEY, JSON.stringify(val))
    }, { deep: true })

    function setBudget(category: string, limit: number) {
        const idx = budgets.value.findIndex(b => b.category === category)
        if (idx !== -1) {
            budgets.value[idx] = { category, limit }
        } else {
            budgets.value.push({ category, limit })
        }
    }

    function removeBudget(category: string) {
        budgets.value = budgets.value.filter(b => b.category !== category)
    }

    function getBudget(category: string) {
        return computed(() => budgets.value.find(b => b.category === category))
    }

    return { budgets, setBudget, removeBudget, getBudget }
})
