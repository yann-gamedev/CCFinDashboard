import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const GUEST_KEY = 'ccfin-guest'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<SupabaseUser | null>(null)
    const isGuest = ref<boolean>(localStorage.getItem(GUEST_KEY) === 'true')
    const isLoading = ref<boolean>(true)

    const isAuthenticated = computed(() => !!user.value)
    const isLoggedInOrGuest = computed(() => isAuthenticated.value || isGuest.value)

    // Try to get display name from user metadata, fallback to email, then guest
    const displayName = computed(() => {
        if (user.value) {
            return user.value.user_metadata?.username || user.value.email?.split('@')[0] || 'User'
        }
        if (isGuest.value) return 'Tamu'
        return ''
    })

    // Initialize session
    supabase.auth.getSession().then(({ data: { session } }) => {
        user.value = session?.user || null
        if (user.value) isGuest.value = false
        isLoading.value = false
    }).catch((err) => {
        console.error('Failed to get Supabase session:', err)
        isLoading.value = false
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
        if (user.value) {
            isGuest.value = false
            localStorage.removeItem(GUEST_KEY)
            loadFromCloud()
        }
    })

    async function login(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message)
        return { message: 'Login berhasil!' }
    }

    async function register(username: string, email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username // Save username in user_metadata
                }
            }
        })

        if (error) throw new Error(error.message)

        // Automatically login after signup
        if (data.session) {
            await supabase.auth.setSession(data.session)
        }

        return { message: 'Registrasi berhasil!' }
    }

    async function loadFromCloud() {
        if (!user.value) return

        const { data, error } = await supabase
            .from('user_data')
            .select('transactions, budgets, recurring, settings')
            .eq('user_id', user.value.id)
            .single()

        if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
            console.error('Error loading data from Supabase:', error)
            return
        }

        if (data) {
            if (data.transactions?.length) localStorage.setItem('ccfin-transactions', JSON.stringify(data.transactions))
            if (data.budgets?.length) localStorage.setItem('ccfin-budgets', JSON.stringify(data.budgets))
            if (data.recurring?.length) localStorage.setItem('ccfin-recurring', JSON.stringify(data.recurring))
            if (data.settings && Object.keys(data.settings).length) localStorage.setItem('ccfin-settings', JSON.stringify(data.settings))
        }
    }

    async function migrateGuestData() {
        if (!user.value) return

        const localTransactions = JSON.parse(localStorage.getItem('ccfin-transactions') || '[]')
        const localBudgets = JSON.parse(localStorage.getItem('ccfin-budgets') || '[]')
        const localRecurring = JSON.parse(localStorage.getItem('ccfin-recurring') || '[]')
        const localSettings = JSON.parse(localStorage.getItem('ccfin-settings') || '{}')

        if (localTransactions.length === 0 && localBudgets.length === 0 && localRecurring.length === 0) {
            return
        }

        const { data: cloudData } = await supabase
            .from('user_data')
            .select('transactions, budgets, recurring, settings')
            .eq('user_id', user.value.id)
            .single()

        let mergedTransactions = [...localTransactions]
        let mergedBudgets = [...localBudgets]
        let mergedRecurring = [...localRecurring]
        let mergedSettings = { ...localSettings }

        if (cloudData) {
            const existingTxnIds = new Set((cloudData.transactions || []).map((t: any) => t.id))
            const newTxns = localTransactions.filter((t: any) => !existingTxnIds.has(t.id))
            mergedTransactions = [...(cloudData.transactions || []), ...newTxns]

            const budgetMap = new Map((cloudData.budgets || []).map((b: any) => [b.category, b]))
            localBudgets.forEach((b: any) => budgetMap.set(b.category, b))
            mergedBudgets = Array.from(budgetMap.values())

            const existingRecIds = new Set((cloudData.recurring || []).map((r: any) => r.id))
            const newRecurring = localRecurring.filter((r: any) => !existingRecIds.has(r.id))
            mergedRecurring = [...(cloudData.recurring || []), ...newRecurring]

            mergedSettings = { ...(cloudData.settings || {}), ...localSettings }
        }

        await supabase.from('user_data').upsert({
            user_id: user.value.id,
            transactions: mergedTransactions,
            budgets: mergedBudgets,
            recurring: mergedRecurring,
            settings: mergedSettings
        }, { onConflict: 'user_id' })
    }

    async function syncToCloud() {
        if (!user.value) return

        const transactions = JSON.parse(localStorage.getItem('ccfin-transactions') || '[]')
        const budgets = JSON.parse(localStorage.getItem('ccfin-budgets') || '[]')
        const recurring = JSON.parse(localStorage.getItem('ccfin-recurring') || '[]')
        const settings = JSON.parse(localStorage.getItem('ccfin-settings') || '{}')

        const { error } = await supabase.from('user_data').upsert({
            user_id: user.value.id,
            transactions,
            budgets,
            recurring,
            settings
        }, { onConflict: 'user_id' })

        if (error) {
            console.error('Error syncing to Supabase:', error)
        }
    }

    function continueAsGuest() {
        isGuest.value = true
        localStorage.setItem(GUEST_KEY, 'true')
    }

    async function logout() {
        await supabase.auth.signOut()
        user.value = null
        isGuest.value = false
        localStorage.removeItem(GUEST_KEY)
    }

    return {
        user,
        isGuest,
        isLoading,
        isAuthenticated,
        isLoggedInOrGuest,
        displayName,
        login,
        register,
        migrateGuestData,
        syncToCloud,
        continueAsGuest,
        logout,
    }
})
