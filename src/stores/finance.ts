import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([])

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

  function deleteTransaction(id: string) {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  return { 
    transactions, 
    totalIncome, 
    totalExpense, 
    balance, 
    addTransaction, 
    deleteTransaction 
  }
})