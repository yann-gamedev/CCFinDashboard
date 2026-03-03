import { ref, onMounted, watch } from 'vue'

export function useCountUp(target: () => number, duration = 800) {
    const display = ref(0)
    let animFrame: number | null = null

    function animate(from: number, to: number) {
        if (animFrame) cancelAnimationFrame(animFrame)
        const start = performance.now()

        const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            display.value = Math.round(from + (to - from) * eased)

            if (progress < 1) {
                animFrame = requestAnimationFrame(step)
            }
        }

        animFrame = requestAnimationFrame(step)
    }

    onMounted(() => {
        animate(0, target())
    })

    watch(target, (newVal, oldVal) => {
        animate(oldVal ?? 0, newVal)
    })

    return display
}
