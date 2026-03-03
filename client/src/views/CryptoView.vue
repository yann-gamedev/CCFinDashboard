<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  sparkline_in_7d: { price: number[] }
}

const coins = ref<CoinData[]>([])
const loading = ref(true)
const error = ref('')
let interval: ReturnType<typeof setInterval> | null = null
let abortController: AbortController | null = null

const formatUSD = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatMarketCap = (value: number) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(0)}`
}

const fetchCoins = async () => {
  if (abortController) abortController.abort()
  abortController = new AbortController()

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h',
      { signal: abortController.signal }
    )
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    coins.value = await res.json()
    error.value = ''
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'Failed to fetch'
  } finally {
    loading.value = false
  }
}

// Simple sparkline using SVG polyline
const getSparklinePath = (prices: number[]) => {
  if (!prices || prices.length === 0) return ''
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 120
  const h = 40
  const step = w / (prices.length - 1)

  return prices.map((p, i) => {
    const x = i * step
    const y = h - ((p - min) / range) * h
    return `${x},${y}`
  }).join(' ')
}

const getSparklineColor = (change: number) => change >= 0 ? '#22c55e' : '#ef4444'

onMounted(() => {
  fetchCoins()
  interval = setInterval(fetchCoins, 60000) // refresh every 60s
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (abortController) abortController.abort()
})
</script>

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Market Kripto</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm">Data harga dari CoinGecko, diperbarui setiap menit.</p>
      </div>
      <button @click="fetchCoins(); loading = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        🔄 Refresh
      </button>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center">
      <p class="font-medium">⚠️ {{ error }}</p>
      <p class="text-sm mt-2 text-red-500">CoinGecko API may be rate-limited. Try again in a minute.</p>
    </div>

    <!-- Coin Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="coin in coins" :key="coin.id"
           class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <img :src="coin.image" :alt="coin.name" class="w-8 h-8 rounded-full">
            <div>
              <p class="font-bold text-slate-800 dark:text-white text-sm">{{ coin.name }}</p>
              <p class="text-xs text-slate-400 uppercase">{{ coin.symbol }}</p>
            </div>
          </div>
          <span :class="coin.price_change_percentage_24h >= 0 ? 'text-green-500 bg-green-50 dark:bg-green-900/30' : 'text-red-500 bg-red-50 dark:bg-red-900/30'"
                class="px-2 py-1 rounded-lg text-xs font-bold">
            {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{ coin.price_change_percentage_24h?.toFixed(2) }}%
          </span>
        </div>

        <p class="text-xl font-bold text-slate-800 dark:text-white mb-2">{{ formatUSD(coin.current_price) }}</p>

        <!-- Sparkline -->
        <svg v-if="coin.sparkline_in_7d?.price" class="w-full h-10 mb-2" viewBox="0 0 120 40" preserveAspectRatio="none">
          <polyline
            :points="getSparklinePath(coin.sparkline_in_7d.price)"
            fill="none"
            :stroke="getSparklineColor(coin.price_change_percentage_24h)"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <div class="flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>MCap: {{ formatMarketCap(coin.market_cap) }}</span>
          <span>Vol: {{ formatMarketCap(coin.total_volume) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
