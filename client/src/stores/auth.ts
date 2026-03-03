import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../composables/useApi'

const TOKEN_KEY = 'ccfin-token'
const USER_KEY = 'ccfin-user'
const GUEST_KEY = 'ccfin-guest'

interface User {
    _id: string
    username: string
    email: string
}

interface LoginResponse {
    token: string
    user: User
    data?: {
        transactions?: unknown[]
        budgets?: unknown[]
        recurring?: unknown[]
        settings?: Record<string, unknown>
    }
    message: string
}

interface RegisterResponse {
    token: string
    user: User
    message: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
    const user = ref<User | null>((() => {
        try {
            const stored = localStorage.getItem(USER_KEY)
            return stored ? JSON.parse(stored) : null
        } catch { return null }
    })())
    const isGuest = ref<boolean>(localStorage.getItem(GUEST_KEY) === 'true')

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const isLoggedInOrGuest = computed(() => isAuthenticated.value || isGuest.value)
    const displayName = computed(() => {
        if (user.value) return user.value.username
        if (isGuest.value) return 'Tamu'
        return ''
    })

    function setAuth(t: string, u: User) {
        token.value = t
        user.value = u
        isGuest.value = false
        localStorage.setItem(TOKEN_KEY, t)
        localStorage.setItem(USER_KEY, JSON.stringify(u))
        localStorage.removeItem(GUEST_KEY)
    }

    async function login(email: string, password: string) {
        const res = await api<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { email, password },
        })

        setAuth(res.token, res.user)

        // Load cloud data into localStorage (overwrites local)
        if (res.data) {
            if (res.data.transactions) {
                localStorage.setItem('ccfin-transactions', JSON.stringify(res.data.transactions))
            }
            if (res.data.budgets) {
                localStorage.setItem('ccfin-budgets', JSON.stringify(res.data.budgets))
            }
            if (res.data.recurring) {
                localStorage.setItem('ccfin-recurring', JSON.stringify(res.data.recurring))
            }
            if (res.data.settings) {
                localStorage.setItem('ccfin-settings', JSON.stringify(res.data.settings))
            }
        }

        return res
    }

    async function register(username: string, email: string, password: string) {
        const res = await api<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: { username, email, password },
        })

        setAuth(res.token, res.user)
        return res
    }

    async function migrateGuestData() {
        if (!token.value) return

        const transactions = JSON.parse(localStorage.getItem('ccfin-transactions') || '[]')
        const budgets = JSON.parse(localStorage.getItem('ccfin-budgets') || '[]')
        const recurring = JSON.parse(localStorage.getItem('ccfin-recurring') || '[]')
        const settings = JSON.parse(localStorage.getItem('ccfin-settings') || '{}')

        if (transactions.length === 0 && budgets.length === 0 && recurring.length === 0) {
            return // nothing to migrate
        }

        await api('/data/merge', {
            method: 'POST',
            token: token.value,
            body: { transactions, budgets, recurring, settings },
        })
    }

    async function syncToCloud() {
        if (!token.value) return

        const transactions = JSON.parse(localStorage.getItem('ccfin-transactions') || '[]')
        const budgets = JSON.parse(localStorage.getItem('ccfin-budgets') || '[]')
        const recurring = JSON.parse(localStorage.getItem('ccfin-recurring') || '[]')
        const settings = JSON.parse(localStorage.getItem('ccfin-settings') || '{}')

        await api('/data', {
            method: 'PUT',
            token: token.value,
            body: { transactions, budgets, recurring, settings },
        })
    }

    function continueAsGuest() {
        isGuest.value = true
        localStorage.setItem(GUEST_KEY, 'true')
    }

    function logout() {
        token.value = null
        user.value = null
        isGuest.value = false
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(GUEST_KEY)
    }

    return {
        token,
        user,
        isGuest,
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
