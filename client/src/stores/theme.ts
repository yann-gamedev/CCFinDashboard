import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEME_KEY = 'ccfin-theme'

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(localStorage.getItem(THEME_KEY) === 'dark')

    watch(isDark, (val) => {
        localStorage.setItem(THEME_KEY, val ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', val)
    }, { immediate: true })

    function toggle() {
        isDark.value = !isDark.value
    }

    return { isDark, toggle }
})
