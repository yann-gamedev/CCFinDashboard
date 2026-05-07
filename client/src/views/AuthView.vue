<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { Package, Check, User } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)

// Login form
const loginEmail = ref('')
const loginPassword = ref('')

// Register form
const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')

// Show migrate dialog after register
const showMigrateDialog = ref(false)

const handleLogin = async () => {
  if (!loginEmail.value || !loginPassword.value) {
    toast.warning('Email dan password harus diisi!')
    return
  }

  loading.value = true
  try {
    const res = await authStore.login(loginEmail.value, loginPassword.value)
    toast.success(res.message || 'Login berhasil!')
    // login() already loaded cloud data, just navigate
    router.push('/dashboard')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Login gagal.')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!regUsername.value || !regEmail.value || !regPassword.value) {
    toast.warning('Semua field harus diisi!')
    return
  }

  if (regPassword.value.length < 6) {
    toast.warning('Password minimal 6 karakter!')
    return
  }

  if (regPassword.value !== regConfirm.value) {
    toast.warning('Konfirmasi password tidak cocok!')
    return
  }

  loading.value = true
  try {
    const res = await authStore.register(regUsername.value, regEmail.value, regPassword.value)
    toast.success(res.message || 'Registrasi berhasil!')

    // If email confirmation is needed, stay on auth page
    if (res.needsConfirmation) {
      activeTab.value = 'login'
      loading.value = false
      return
    }

    // Check if guest has existing data to migrate
    const existingTxn = JSON.parse(localStorage.getItem('ccfin-transactions') || '[]')
    if (existingTxn.length > 0) {
      showMigrateDialog.value = true
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Registrasi gagal.')
  } finally {
    loading.value = false
  }
}

const migrateAndContinue = async () => {
  loading.value = true
  try {
    await authStore.migrateGuestData()
    toast.success('Data berhasil dipindahkan ke akun!')
  } catch {
    toast.warning('Gagal memindah data, tapi akun tetap dibuat.')
  }
  loading.value = false
  router.push('/dashboard')
}

const skipMigrate = () => {
  router.push('/dashboard')
}

const continueAsGuest = () => {
  authStore.continueAsGuest()
  toast.info('Melanjutkan sebagai tamu. Data disimpan di browser.')
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold italic bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CCFin.</h1>
        <p class="text-slate-400 text-sm mt-2">Dashboard Keuangan Pribadimu</p>
      </div>

      <!-- Migrate Dialog -->
      <div v-if="showMigrateDialog" class="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div class="text-center">
          <Package class="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-white mb-2">Data Ditemukan!</h3>
          <p class="text-sm text-slate-400 mb-6">Kamu punya data transaksi di browser ini. Mau dipindahkan ke akunmu?</p>
          <div class="space-y-3">
            <button @click="migrateAndContinue" :disabled="loading"
                    class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
              <span v-if="loading">Memindahkan...</span>
              <span v-else class="flex items-center justify-center gap-2"><Check class="w-4 h-4" /> Ya, Pindahkan Data</span>
            </button>
            <button @click="skipMigrate"
                    class="w-full py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-600 transition-colors">
              Mulai Dari Awal
            </button>
          </div>
        </div>
      </div>

      <!-- Auth Card -->
      <div v-else class="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <!-- Tab Switcher -->
        <div class="flex bg-slate-900 rounded-xl p-1 mb-8">
          <button @click="activeTab = 'login'"
                  :class="activeTab === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
                  class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200">
            Masuk
          </button>
          <button @click="activeTab = 'register'"
                  :class="activeTab === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
                  class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200">
            Daftar
          </button>
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
            <input v-model="loginEmail" type="email" placeholder="email@contoh.com"
                   class="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
            <input v-model="loginPassword" type="password" placeholder="••••••••"
                   class="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>
          <button type="submit" :disabled="loading"
                  class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Username</label>
            <input v-model="regUsername" type="text" placeholder="username_kamu"
                   class="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
            <input v-model="regEmail" type="email" placeholder="email@contoh.com"
                   class="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
            <input v-model="regPassword" type="password" placeholder="Minimal 6 karakter"
                   class="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Konfirmasi Password</label>
            <input v-model="regConfirm" type="password" placeholder="Ulangi password"
                   class="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>
          <button type="submit" :disabled="loading"
                  class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
            {{ loading ? 'Memproses...' : 'Daftar' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-slate-700"></div>
          <span class="text-xs text-slate-500 font-medium">atau</span>
          <div class="flex-1 h-px bg-slate-700"></div>
        </div>

        <!-- Guest Button -->
        <button @click="continueAsGuest"
                class="w-full py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
          <User class="w-4 h-4" />
          <span>Lanjutkan sebagai Tamu</span>
        </button>

        <p class="text-center text-xs text-slate-500 mt-4">
          Mode tamu menyimpan data di browser saja.
        </p>
      </div>
    </div>
  </div>
</template>
