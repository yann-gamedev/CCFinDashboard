<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <p class="text-6xl mb-4">🔍</p>
    <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">404</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-6">Halaman tidak ditemukan.</p>
    <RouterLink to="/dashboard"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
      ← Kembali ke Dashboard
    </RouterLink>
  </div>
</template>
