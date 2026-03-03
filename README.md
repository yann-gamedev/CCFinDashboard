# CCFin. — Dashboard Keuangan Pribadi

<div align="center">

**Pantau pemasukan, pengeluaran, anggaran, dan market kripto secara real-time.**

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.12-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## ✨ Fitur

### 💰 Keuangan
- **Dashboard** — Ringkasan saldo, pemasukan, pengeluaran dengan animasi count-up
- **Transaksi CRUD** — Tambah, edit, hapus dengan konfirmasi inline
- **Kategori** — Makanan, Transportasi, Hiburan, Gaji, Tagihan, Belanja, Investasi
- **Anggaran Bulanan** — Set limit per kategori, progress bar otomatis
- **Transaksi Berulang** — Otomatis buat tagihan bulanan/mingguan (sewa, langganan)
- **Export CSV** — Download semua transaksi ke file `.csv`
- **Filter & Pencarian** — Cari by judul, filter by tipe/kategori/tanggal

### 📊 Visualisasi
- **Tren Bulanan** — Line chart pemasukan vs pengeluaran
- **Analitik** — Doughnut chart (income vs expense) + bar chart per kategori
- **Market Kripto** — 20 koin teratas dari CoinGecko dengan sparkline 7 hari

### 👤 Akun & Data
- **3 Mode Pengguna:**
  - 🔐 **Login** — Data disimpan di cloud (MongoDB)
  - 📝 **Register** — Buat akun baru, migrasi data tamu otomatis
  - 👤 **Tamu** — Langsung pakai, data di browser (localStorage)
- **Backup & Restore** — Export/import semua data sebagai file JSON
- **Hapus Data** — Konfirmasi "ketik HAPUS" untuk keamanan
- **Sinkronisasi Cloud** — Otomatis sync ke database saat login (debounced 3s)

### 🎨 Tampilan
- **Dark/Light Mode** — Toggle theme dengan transisi halus
- **Animasi** — Page transitions, staggered card entrance, count-up numbers
- **Responsive** — Desktop sidebar + mobile bottom tab bar
- **Skeleton Loader** — Placeholder shimmer saat loading

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vue 3, Pinia, Vue Router, TypeScript |
| Styling | Tailwind CSS v4, Plus Jakarta Sans font |
| Charts | Chart.js + vue-chartjs |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Build | Vite 7 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- MongoDB Atlas account (gratis) atau MongoDB lokal

### 1. Clone
```bash
git clone https://github.com/yann-gamedev/CCFinDashboard.git
cd CCFinDashboard
```

### 2. Setup Backend
```bash
cd server
npm install
```

Buat file `.env` di folder `server/`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ccfin?retryWrites=true&w=majority
JWT_SECRET=ganti_dengan_secret_key_kamu
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **⚠️ Penting:** Pastikan IP kamu sudah di-whitelist di MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere.

Start server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npx vite --port 5173
```

### 4. Buka App
Buka [http://localhost:5173](http://localhost:5173) — pilih Login, Register, atau lanjut sebagai Tamu.

---

## 📁 Struktur Proyek

```
CCFinDashboard/
├── client/                      # Frontend (Vue 3)
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── AnalyticsChart.vue
│   │   │   ├── BudgetTracker.vue
│   │   │   ├── DataManager.vue
│   │   │   ├── ErrorBoundary.vue
│   │   │   ├── MonthlyTrendChart.vue
│   │   │   ├── RecurringManager.vue
│   │   │   ├── SkeletonLoader.vue
│   │   │   ├── ToastContainer.vue
│   │   │   ├── TransactionForm.vue
│   │   │   └── TransactionList.vue
│   │   ├── composables/         # Reusable logic
│   │   │   ├── useApi.ts
│   │   │   ├── useCountUp.ts
│   │   │   └── useToast.ts
│   │   ├── constants/
│   │   │   └── categories.ts
│   │   ├── stores/              # Pinia State
│   │   │   ├── auth.ts
│   │   │   ├── budget.ts
│   │   │   ├── finance.ts
│   │   │   ├── recurring.ts
│   │   │   ├── settings.ts
│   │   │   └── theme.ts
│   │   ├── utils/
│   │   │   └── format.ts
│   │   ├── views/               # Pages
│   │   │   ├── AuthView.vue
│   │   │   ├── CryptoView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── NotFoundView.vue
│   │   │   ├── SettingsView.vue
│   │   │   └── TransactionsView.vue
│   │   ├── router/index.ts
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
│
├── server/                      # Backend (Express)
│   ├── controllers/
│   │   ├── authController.js
│   │   └── dataController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── UserData.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── data.js
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Buat akun baru |
| POST | `/api/auth/login` | ❌ | Login, dapat JWT + data |
| GET | `/api/auth/profile` | ✅ | Info user |
| GET | `/api/data` | ✅ | Ambil semua data user |
| PUT | `/api/data` | ✅ | Simpan data user |
| POST | `/api/data/merge` | ✅ | Gabung data tamu ke akun |
| GET | `/api/health` | ❌ | Status server + database |

---

## 📱 Halaman

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Login/Register | `/auth` | Autentikasi atau masuk sebagai tamu |
| Dashboard | `/dashboard` | Ringkasan keuangan + chart |
| Transaksi | `/transactions` | Kelola semua transaksi |
| Market Kripto | `/crypto` | Harga kripto real-time |
| Pengaturan | `/settings` | Profil, tema, backup, about |

---

## 🔒 Keamanan

- Password di-hash dengan **bcrypt** (12 rounds)
- JWT token berlaku **7 hari**
- `.env` tidak ikut di-commit (ada di `.gitignore`)
- Konfirmasi ketik "HAPUS" sebelum menghapus semua data
- CSV export dengan escaping karakter khusus
- CORS dibatasi sesuai `CLIENT_URL`

---

## 📄 License

MIT © [yann-gamedev](https://github.com/yann-gamedev)
