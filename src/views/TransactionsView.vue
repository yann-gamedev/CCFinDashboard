<script setup lang="ts">
import TransactionForm from '../components/TransactionForm.vue'
import TransactionList from '../components/TransactionList.vue'
</script>

<template>
  <div>
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">Transaksi</h1>
      <p class="text-slate-500 text-sm">Kelola semua transaksi keuanganmu.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1">
        <TransactionForm />
      </div>
      <div class="lg:col-span-2">
        <TransactionList />
      </div>
    </div>
  </div>
</template>
