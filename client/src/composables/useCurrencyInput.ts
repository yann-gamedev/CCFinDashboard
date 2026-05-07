import { ref } from 'vue'

/**
 * Composable for handling currency input with thousand separators.
 * Displays formatted value (e.g. "1.000.000") while storing raw number internally.
 */
export function useCurrencyInput(initialValue: number | null = null) {
    const rawValue = ref<number | null>(initialValue)

    // The display string shown in the text input (e.g. "1.000.000")
    const displayValue = ref(initialValue ? formatWithDots(initialValue) : '')

    function formatWithDots(num: number): string {
        return num.toLocaleString('id-ID')
    }

    function stripNonDigits(str: string): string {
        return str.replace(/\D/g, '')
    }

    /** Call this on @input of a text input */
    function onInput(event: Event) {
        const input = event.target as HTMLInputElement
        const cursorPos = input.selectionStart ?? 0

        // Count digits before cursor in old value
        const oldValue = input.value
        const digitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\D/g, '').length

        // Extract raw digits
        const digits = stripNonDigits(input.value)

        if (digits === '') {
            rawValue.value = null
            displayValue.value = ''
            return
        }

        const num = parseInt(digits, 10)
        rawValue.value = num
        displayValue.value = formatWithDots(num)

        // Restore cursor position: find position where N digits have been passed
        requestAnimationFrame(() => {
            const newValue = input.value
            let digitCount = 0
            let newPos = 0
            for (let i = 0; i < newValue.length; i++) {
                if (/\d/.test(newValue[i]!)) {
                    digitCount++
                }
                if (digitCount === digitsBeforeCursor) {
                    newPos = i + 1
                    break
                }
            }
            if (digitCount < digitsBeforeCursor) {
                newPos = newValue.length
            }
            input.setSelectionRange(newPos, newPos)
        })
    }

    /** Reset value */
    function reset() {
        rawValue.value = null
        displayValue.value = ''
    }

    /** Set value programmatically */
    function setValue(num: number | null) {
        rawValue.value = num
        displayValue.value = num ? formatWithDots(num) : ''
    }

    return {
        rawValue,
        displayValue,
        onInput,
        reset,
        setValue,
    }
}
