import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'ccfin-settings'

export interface AppSettings {
    username: string
    currency: 'IDR' | 'USD'
    language: 'id' | 'en'
    defaultCategory: string
    accentColor: string
}

const defaults: AppSettings = {
    username: '',
    currency: 'IDR',
    language: 'id',
    defaultCategory: '',
    accentColor: '#3b82f6',
}

function loadSettings(): AppSettings {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? { ...defaults, ...JSON.parse(data) } : { ...defaults }
    } catch {
        return { ...defaults }
    }
}

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<AppSettings>(loadSettings())

    watch(settings, (val) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }, { deep: true })

    function resetSettings() {
        Object.assign(settings.value, defaults)
    }

    return { settings, resetSettings }
})
