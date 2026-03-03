import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'ccfin-transactions'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>(loadTransactions())

  // Persist to localStorage on every change
  watch(transactions, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  function addTransaction(transaction: Transaction) {
    transactions.value.push(transaction)
  }

  function editTransaction(id: string, updated: Partial<Transaction>) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...updated, id } as Transaction
    }
  }

  function deleteTransaction(id: string) {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  return {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    addTransaction,
    editTransaction,
    deleteTransaction
  }
})