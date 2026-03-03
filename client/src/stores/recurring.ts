import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useFinanceStore } from './finance'

const STORAGE_KEY = 'ccfin-recurring'

export interface RecurringTransaction {
    id: string
    title: string
    amount: number
    type: 'income' | 'expense'
    category: string
    frequency: 'monthly' | 'weekly'
    nextDate: string
    enabled: boolean
}

function loadRecurring(): RecurringTransaction[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

export const useRecurringStore = defineStore('recurring', () => {
    const items = ref<RecurringTransaction[]>(loadRecurring())

    watch(items, (val) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }, { deep: true })

    function addRecurring(item: RecurringTransaction) {
        items.value.push(item)
    }

    function removeRecurring(id: string) {
        items.value = items.value.filter(i => i.id !== id)
    }

    function toggleEnabled(id: string) {
        const item = items.value.find(i => i.id === id)
        if (item) item.enabled = !item.enabled
    }

    function processRecurring() {
        const financeStore = useFinanceStore()
        const today = new Date().toISOString().split('T')[0]
        let created = 0

        items.value.forEach(item => {
            if (!item.enabled) return

            while (item.nextDate <= today) {
                financeStore.addTransaction({
                    id: crypto.randomUUID(),
                    title: `${item.title} (otomatis)`,
                    amount: item.amount,
                    type: item.type,
                    category: item.category,
                    date: item.nextDate,
                })
                created++

                // Advance nextDate
                const d = new Date(item.nextDate)
                if (item.frequency === 'monthly') {
                    d.setMonth(d.getMonth() + 1)
                } else {
                    d.setDate(d.getDate() + 7)
                }
                item.nextDate = d.toISOString().split('T')[0]
            }
        })

        return created
    }

    return { items, addRecurring, removeRecurring, toggleEnabled, processRecurring }
})
