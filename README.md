# CCFin. — Dashboard Keuangan Pribadi

<div align="center">

**Pantau pemasukan, pengeluaran, anggaran, dan market kripto secara real-time.**

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC?logo=tailwindcss&logoColor=white)

</div>

---

## Fitur

### Keuangan
- **Dashboard** — Ringkasan saldo, pemasukan, pengeluaran dengan animasi count-up
- **Transaksi CRUD** — Tambah, edit, hapus dengan konfirmasi inline
- **Kategori** — Makanan, Transportasi, Hiburan, Gaji, Tagihan, Belanja, Investasi
- **Anggaran Bulanan** — Set limit per kategori, progress bar otomatis
- **Transaksi Berulang** — Otomatis buat tagihan bulanan/mingguan (sewa, langganan)
- **Input Nominal Lanjut** — Menggunakan Thousand Separator untuk angka nominal yang lebih rapi
- **Export CSV** — Download semua transaksi ke file .csv
- **Filter & Pencarian** — Cari by judul, filter by tipe/kategori/tanggal

### Visualisasi
- **Tren Bulanan** — Line chart pemasukan vs pengeluaran
- **Analitik** — Doughnut chart (income vs expense) + bar chart per kategori
- **Market Kripto** — 20 koin teratas dari CoinGecko dengan sparkline 7 hari

### Akun & Data
- **3 Mode Pengguna:**
  - **Login** — Data disimpan di cloud database (Supabase) dengan arsitektur isolasi data
  - **Register** — Buat akun baru, migrasi data tamu otomatis jika ada
  - **Tamu** — Langsung pakai, data di browser (localStorage)
- **Backup & Restore** — Export/import semua data sebagai file JSON
- **Hapus Data** — Konfirmasi keamanan sebelum menghapus semua data
- **Sinkronisasi Cloud** — Otomatis tersinkronisasi ke Supabase saat digunakan

### Tampilan
- **Ikon Rapi** — Seluruh antarmuka menggunakan library profesional lucide-vue-next (bebas emoji)
- **Dark/Light Mode** — Toggle theme dengan transisi halus
- **Animasi** — Page transitions, staggered card entrance, count-up numbers
- **Responsive** — Desktop sidebar + mobile bottom tab bar
- **Skeleton Loader** — Placeholder shimmer saat loading

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vue 3, Pinia, Vue Router, TypeScript |
| Styling | Tailwind CSS v4, Plus Jakarta Sans font |
| Charts | Chart.js + vue-chartjs |
| Icons | lucide-vue-next |
| Backend & DB | Supabase (PostgreSQL, Auth) |
| Build | Vite 7 |

---

## Quick Start

### Prerequisites
- Node.js >= 20
- Proyek Supabase (Database & Auth)

### 1. Clone
```bash
git clone https://github.com/yann-gamedev/CCFinDashboard.git
cd CCFinDashboard
```

### 2. Setup Supabase
- Buka dashboard Supabase dan jalankan seluruh query SQL dari file `supabase-setup.sql` yang ada di direktori root.
- Buka Authentication -> Providers -> Email -> matikan "Confirm email" jika ingin melakukan testing secara instan.

### 3. Setup Frontend Client
```bash
cd client
npm install
```

Buat file `.env.local` di folder `client/`:
```env
VITE_SUPABASE_URL=https://<your_supabase_project_domain>.supabase.co
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

Start server lokal:
```bash
npm run dev
```

### 4. Buka App
Buka http://localhost:5173 — pilih Login, Register, atau lanjut sebagai Tamu.

---

## Struktur Proyek

```text
CCFinDashboard/
├── client/                      # Frontend (Vue 3)
│   ├── src/
│   │   ├── assets/              # CSS Styles
│   │   ├── components/          # UI Components
│   │   ├── composables/         # Reusable logic (useCurrencyInput, dll)
│   │   ├── lib/                 # Konfigurasi Supabase Client
│   │   ├── stores/              # Pinia State Management
│   │   ├── utils/               # Formatting utilities
│   │   ├── views/               # Pages & Routing views
│   │   ├── router/index.ts
│   │   ├── App.vue
│   │   └── main.ts
│   ├── .env.local               # Environment Variables
│   └── package.json
├── supabase-setup.sql           # Database Initialization Query
├── package.json                 # Global scripts
└── README.md
```

---

## Halaman

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Login/Register | `/auth` | Autentikasi atau masuk sebagai tamu |
| Dashboard | `/dashboard` | Ringkasan keuangan + chart |
| Transaksi | `/transactions` | Kelola semua transaksi |
| Market Kripto | `/crypto` | Harga kripto real-time |
| Pengaturan | `/settings` | Profil, tema, backup, about |

---

## Keamanan & Reliabilitas

- Otentikasi Supabase dengan session timeout management.
- Implementasi Row Level Security (RLS) di database sehingga data pengguna aman dan terisolasi.
- Debounce protection pada sinkronisasi cloud untuk menghindari network overfetching.
- Timeout otomatis dan recovery data dari storage lokal.
- `.env.local` di-ignore oleh Git agar kredensial aman.
