<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'
import { useThemeStore } from '../stores/theme'
import { CATEGORIES } from '../constants/categories'
import DataManager from '../components/DataManager.vue'
import { User, Palette, Database, Info, ExternalLink } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const themeStore = useThemeStore()
</script>

<template>
  <div>
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm">Personalisasi dashboard keuanganmu.</p>
    </header>

    <div class="space-y-8 max-w-2xl">
      <!-- Profile -->
      <section class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
          <User class="w-5 h-5" /> Profil
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nama Tampilan</label>
            <input v-model="settingsStore.settings.username" type="text" placeholder="Nama kamu"
                   class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kategori Default</label>
            <select v-model="settingsStore.settings.defaultCategory"
                    class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tidak ada</option>
              <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Appearance -->
      <section class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
          <Palette class="w-5 h-5" /> Tampilan
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Mode Gelap</p>
              <p class="text-xs text-slate-400">Aktifkan tema gelap untuk penggunaan malam hari.</p>
            </div>
            <button @click="themeStore.toggle()"
                    class="relative w-12 h-6 rounded-full transition-colors duration-200"
                    :class="themeStore.isDark ? 'bg-blue-600' : 'bg-slate-200'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    :class="themeStore.isDark ? 'translate-x-6' : ''"></span>
            </button>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mata Uang</label>
            <select v-model="settingsStore.settings.currency"
                    class="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="IDR">Rupiah (Rp)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Data Management -->
      <section class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
          <Database class="w-5 h-5" /> Data
        </h3>
        <DataManager />
      </section>

      <!-- About -->
      <section class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
          <Info class="w-5 h-5" /> Tentang
        </h3>
        <div class="text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <p><strong class="text-slate-700 dark:text-slate-200">CCFin Dashboard</strong> v3.0</p>
          <p>Dashboard keuangan pribadi untuk melacak pemasukan, pengeluaran, dan anggaran.</p>
          <p class="pt-2">
            <a href="https://github.com/yann-gamedev/CCFinDashboard" target="_blank" rel="noopener"
               class="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
              GitHub Repository <ExternalLink class="w-3 h-3" />
            </a>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
