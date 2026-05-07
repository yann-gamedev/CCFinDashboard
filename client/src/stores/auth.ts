import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const GUEST_KEY = 'ccfin-guest'
const DATA_KEYS = ['ccfin-transactions', 'ccfin-budgets', 'ccfin-recurring', 'ccfin-settings']
const LOADING_TIMEOUT_MS = 6000 // Max 6 seconds for loading state

// Map Supabase error messages to user-friendly Indonesian messages
function translateAuthError(message: string): string {
    const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email atau password salah.',
        'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox kamu.',
        'User already registered': 'Email sudah terdaftar. Silakan login.',
        'Email rate limit exceeded': 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.',
        'over_email_send_rate_limit': 'Terlalu banyak email terkirim. Tunggu beberapa menit lalu coba lagi.',
        'Password should be at least 6 characters': 'Password minimal 6 karakter.',
        'Unable to validate email address: invalid format': 'Format email tidak valid.',
        'Signup requires a valid password': 'Password wajib diisi.',
        'Anonymous sign-ins are disabled': 'Registrasi anonim dinonaktifkan.',
    }

    if (errorMap[message]) return errorMap[message]

    for (const [key, value] of Object.entries(errorMap)) {
        if (message.toLowerCase().includes(key.toLowerCase())) return value
    }

    return message
}


export const useAuthStore = defineStore('auth', () => {
    const user = ref<SupabaseUser | null>(null)
    const isGuest = ref<boolean>(localStorage.getItem(GUEST_KEY) === 'true')
    const isLoading = ref<boolean>(true)
    const isSyncing = ref(false)

    const isAuthenticated = computed(() => !!user.value)
    const isLoggedInOrGuest = computed(() => isAuthenticated.value || isGuest.value)

    const displayName = computed(() => {
        if (user.value) {
            return user.value.user_metadata?.username || user.value.email?.split('@')[0] || 'User'
        }
        if (isGuest.value) return 'Tamu'
        return ''
    })

    /** Clear all CCFin data from localStorage */
    function clearLocalData() {
        DATA_KEYS.forEach(key => localStorage.removeItem(key))
    }

    /** Load user data from Supabase cloud into localStorage (with timeout) */
    async function loadFromCloud(): Promise<boolean> {
        if (!user.value) return false

        try {
            // Race: actual query vs timeout
            const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 5000))
            const query = supabase
                .from('user_data')
                .select('transactions, budgets, recurring, settings')
                .eq('user_id', user.value.id)
                .single()
                .then(res => res)

            const result = await Promise.race([query, timeout])

            // Timed out
            if (result === null) {
                console.warn('[Auth] Cloud data load timed out, using local data')
                return false
            }

            const { data, error } = result

            if (error) {
                if (error.code === 'PGRST116') {
                    clearLocalData()
                    return true
                }
                console.error('[Auth] Error loading data:', error)
                return false
            }

            clearLocalData()

            if (data) {
                if (Array.isArray(data.transactions) && data.transactions.length > 0) {
                    localStorage.setItem('ccfin-transactions', JSON.stringify(data.transactions))
                }
                if (Array.isArray(data.budgets) && data.budgets.length > 0) {
                    localStorage.setItem('ccfin-budgets', JSON.stringify(data.budgets))
                }
                if (Array.isArray(data.recurring) && data.recurring.length > 0) {
                    localStorage.setItem('ccfin-recurring', JSON.stringify(data.recurring))
                }
                if (data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
                    localStorage.setItem('ccfin-settings', JSON.stringify(data.settings))
                }
            }

            return true
        } catch (e) {
            console.error('[Auth] Failed to load cloud data:', e)
            return false
        }
    }

    /** Sync current localStorage data to Supabase cloud */
    async function syncToCloud() {
        if (!user.value || isSyncing.value) return

        isSyncing.value = true
        try {
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
                console.error('[Auth] Error syncing to Supabase:', error)
            }
        } finally {
            isSyncing.value = false
        }
    }

    // ── Initialization ──────────────────────────────────────────
    // Safety timeout: if init takes too long, force-resolve loading
    const safetyTimer = setTimeout(() => {
        if (isLoading.value) {
            console.warn('[Auth] Loading safety timeout reached, forcing resolution')
            isLoading.value = false
        }
    }, LOADING_TIMEOUT_MS)

    // Initialize session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        user.value = session?.user || null

        if (user.value) {
            isGuest.value = false
            localStorage.removeItem(GUEST_KEY)
            // Load cloud data but don't block the UI forever
            await loadFromCloud()
        }
    }).catch((err) => {
        console.error('[Auth] Session init failed:', err)
    }).finally(() => {
        clearTimeout(safetyTimer)
        isLoading.value = false
    })

    // Listen for auth state changes (sign in from another flow, token refresh, etc.)
    supabase.auth.onAuthStateChange(async (event, session) => {
        const previousUserId = user.value?.id
        user.value = session?.user || null

        if (event === 'SIGNED_IN' && user.value && user.value.id !== previousUserId) {
            isGuest.value = false
            localStorage.removeItem(GUEST_KEY)
            // Non-blocking: load data in background
            loadFromCloud().catch(() => {})
        }

        if (event === 'SIGNED_OUT') {
            user.value = null
            clearLocalData()
        }
    })

    // ── Auth actions ────────────────────────────────────────────

    async function login(email: string, password: string) {
        clearLocalData()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw new Error(translateAuthError(error.message))

        // Set user immediately so the app knows we're authenticated
        user.value = data.user
        isGuest.value = false
        localStorage.removeItem(GUEST_KEY)

        // Load user's cloud data into localStorage BEFORE navigating
        await loadFromCloud()

        return { message: 'Login berhasil!' }
    }

    async function register(username: string, email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        })

        if (error) throw new Error(translateAuthError(error.message))

        if (data.session) {
            user.value = data.user
            return { message: 'Registrasi berhasil!', needsConfirmation: false }
        }

        if (data.user && !data.session) {
            return { message: 'Registrasi berhasil! Cek email kamu untuk konfirmasi.', needsConfirmation: true }
        }

        return { message: 'Registrasi berhasil!', needsConfirmation: false }
    }

    /** Migrate guest localStorage data to the logged-in user's cloud storage */
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
            const existingTxnIds = new Set((cloudData.transactions || []).map((t: { id: string }) => t.id))
            const newTxns = localTransactions.filter((t: { id: string }) => !existingTxnIds.has(t.id))
            mergedTransactions = [...(cloudData.transactions || []), ...newTxns]

            const budgetMap = new Map((cloudData.budgets || []).map((b: { category: string }) => [b.category, b]))
            localBudgets.forEach((b: { category: string }) => budgetMap.set(b.category, b))
            mergedBudgets = Array.from(budgetMap.values())

            const existingRecIds = new Set((cloudData.recurring || []).map((r: { id: string }) => r.id))
            const newRecurring = localRecurring.filter((r: { id: string }) => !existingRecIds.has(r.id))
            mergedRecurring = [...(cloudData.recurring || []), ...newRecurring]

            mergedSettings = { ...cloudData.settings, ...localSettings }
        }

        const { error } = await supabase.from('user_data').upsert({
            user_id: user.value.id,
            transactions: mergedTransactions,
            budgets: mergedBudgets,
            recurring: mergedRecurring,
            settings: mergedSettings
        }, { onConflict: 'user_id' })

        if (error) {
            console.error('[Auth] Error migrating data:', error)
            throw error
        }

        localStorage.setItem('ccfin-transactions', JSON.stringify(mergedTransactions))
        localStorage.setItem('ccfin-budgets', JSON.stringify(mergedBudgets))
        localStorage.setItem('ccfin-recurring', JSON.stringify(mergedRecurring))
        localStorage.setItem('ccfin-settings', JSON.stringify(mergedSettings))
    }

    function continueAsGuest() {
        isGuest.value = true
        localStorage.setItem(GUEST_KEY, 'true')
    }

    async function logout() {
        try {
            await supabase.auth.signOut()
        } catch (e) {
            console.error('[Auth] Logout error:', e)
        }
        user.value = null
        isGuest.value = false
        localStorage.removeItem(GUEST_KEY)
        clearLocalData()
    }

    return {
        user,
        isGuest,
        isLoading,
        isSyncing,
        isAuthenticated,
        isLoggedInOrGuest,
        displayName,
        login,
        register,
        loadFromCloud,
        migrateGuestData,
        syncToCloud,
        continueAsGuest,
        logout,
    }
})
