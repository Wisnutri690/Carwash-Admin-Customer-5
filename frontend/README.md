# 🚗 Carwash Frontend - APEX Management System

Aplikasi Frontend Single Page Application (SPA) modern untuk **Carwash Management System (APEX Auto Detailing & Carwash)** yang dibangun menggunakan React, TypeScript, Vite, dan Tailwind CSS v4. Aplikasi ini terhubung secara penuh dengan Carwash REST API Backend untuk mengelola data master, operasional pencucian, teknisi detailer, pembayaran instan, dan penerbitan nota resmi.

---

## 🛠️ Tech Stack

* **Core:** React 19, TypeScript
* **Build Tool & Bundler:** Vite
* **Styling:** Tailwind CSS v4 (APEX Dark Luxury Theme)
* **Routing:** React Router v7 (BrowserRouter, ProtectedRoute, 404 Handler)
* **HTTP Client:** Axios (Centralized API client dengan Request/Response Interceptor)
* **Icons:** React Icons (`react-icons/hi`)

---

## 📁 Project Structure

```text
Carwash-Frontend3/
├── public/
├── src/
│   ├── assets/              # Asset gambar & styling statis
│   ├── components/          # Reusable UI components (ProtectedRoute, Modal, dll)
│   ├── config/              # Centralized Axios API client configuration
│   │   └── api.ts
│   ├── layouts/             # Main application layout & floating navigation
│   │   └── MainLayout.tsx
│   ├── pages/               # Feature pages & route views
│   │   ├── Customer/
│   │   │   └── CustomerList.tsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── Login/
│   │   │   └── Login.tsx
│   │   ├── notFound/
│   │   │   └── NotFound.tsx
│   │   ├── Order/
│   │   │   └── OrderList.tsx
│   │   ├── Service/
│   │   │   └── ServiceList.tsx
│   │   ├── Staff/
│   │   │   └── StaffList.tsx
│   │   └── Vehicle/
│   │       └── VehicleList.tsx
│   ├── services/            # API communication services (Service Layer)
│   │   ├── authService.ts
│   │   ├── customerService.ts
│   │   ├── orderService.ts
│   │   ├── serviceService.ts
│   │   ├── staffService.ts
│   │   └── vehicleService.ts
│   ├── types/               # Strict TypeScript interfaces & types
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   ├── order.ts
│   │   ├── service.ts
│   │   ├── staff.ts
│   │   └── vehicle.ts
│   ├── App.tsx              # Root component with routing table
│   ├── index.css            # Global CSS & Tailwind design tokens
│   └── main.tsx             # Application entry point
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 Authentication & Session Flow

Frontend menggunakan JWT Authentication yang disimpan pada `localStorage`:

1. **Login:** Admin memasukkan email dan password di halaman `/login`.
2. **Token Storage:** Token JWT disimpan dengan key `token`, dan data admin disimpan dengan key `admin`.
3. **Axios Interceptor:** Setiap request yang dikirimkan melalui `src/config/api.ts` secara otomatis menyertakan header:
   ```http
   Authorization: Bearer <token>
   ```
4. **Protected Routes:** Halaman operasional dilindungi oleh komponen `<ProtectedRoute />`. Jika belum login, otomatis dialihkan ke `/login`.
5. **Logout:** Menghapus token dari `localStorage` dan meredirect ke halaman login.

---

## 📌 Main Features

### 1. Authentication & Security
* Admin Login dengan validasi form, loading state, dan error handling.
* Proteksi rute halaman privat (`ProtectedRoute`).
* Logout flow dengan pembersihan sesi.

### 2. Operational Dashboard
* Ringkasan metrik statistik (Total Pelanggan, Total Kendaraan, Layanan Aktif, Antrean Cuci, Pendapatan).
* Live status antrean kendaraan yang sedang dicuci.
* Shortcut aksi cepat ke seluruh modul operasional.

### 3. Customer Management
* Menampilkan daftar pelanggan dalam format Grid Card & Tabel.
* Pencarian pelanggan instan berdasarkan nama dan nomor telepon.
* Tambah pelanggan baru, edit data, dan hapus pelanggan dengan modal konfirmasi.

### 4. Vehicle Management
* Daftar kendaraan terdaftar beserta relasi dengan pemilik (Customer).
* Form registrasi kendaraan dengan pemilih pemilik kendaraan dan kategori tipe.
* Edit spesifikasi kendaraan (Plat nomor, Merk, Model, Warna) dan hapus data.

### 5. Service Management
* Manajemen paket perawatan cuci mobil & auto detailing.
* Penentuan harga layanan, estimasi durasi pengerjaan, dan deskripsi.
* Toggle status ketersediaan layanan (**Aktif / Nonaktif**).

### 6. Staff / Detailer Management
* Manajemen staf teknisi cuci dan detailer APEX.
* Pengaturan nomor telepon, posisi penugasan, dan status kesiapan kerja (**Aktif / Cuti**).
* Profil staf yang terhubung langsung ke form order antrean.

### 7. Order & Washing Progression
* **Single Practical Filter Bar:** Filter cepat berdasarkan status (`Semua`, `Antrean`, `Dicuci`, `Selesai`, `Belum Lunas`).
* **Form Buat Order Lebar (2-Kolom):** Menghubungkan pelanggan, kendaraan miliknya, teknisi yang bertugas, multi-select paket layanan, dan catatan khusus.
* **Single Dynamic Progression Button:**
  * Status `WAITING` ➔ Tombol **Mulai Cuci** (mengubah status ke `IN_PROGRESS`).
  * Status `IN_PROGRESS` ➔ Tombol **Tandai Selesai** (mengubah status ke `COMPLETED`).
  * Status `COMPLETED` & `UNPAID` ➔ Tombol **Bayar Sekarang** (membuka modal pembayaran).
  * Status `COMPLETED` & `PAID` ➔ Tombol **Transaksi Lunas • Lihat Nota**.

### 8. Payment & Official Invoice Receipt
* Pop-up pembayaran instan dengan pilihan metode: **QRIS**, **CASH**, atau **TRANSFER**.
* **Nota Transaksi Resmi APEX:** Preview nota faktur bertema workshop detailing elegan lengkap dengan watermark APEX, rincian kendaraan, teknisi, tabel layanan, total tagihan, dan tombol **Cetak Nota** (`window.print()`).

### 9. 404 Route Handler
* Halaman rute khusus ketika URL yang diakses pengguna tidak terdaftar di sistem.

---

## 💳 Order & Payment Lifecycle Flow

```text
[Buat Order Baru]
       ↓
    WAITING (Menunggu Antrean)
       ↓  (Klik: Mulai Cuci)
  IN_PROGRESS (Sedang Dikerjakan)
       ↓  (Klik: Tandai Selesai)
   COMPLETED (Pencucian Selesai)
       ↓  (Klik: Bayar Sekarang)
 [Modal Pembayaran (QRIS / CASH / TRANSFER)]
       ↓
     PAID (Lunas)
       ↓
[Penerbitan Nota / Invoice Resmi & Cetak]
```

---

## 🚀 Installation & Running Locally

### 1. Clone Repository
```bash
git clone <repository-url>
cd Carwash-Frontend3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variable
Buat file `.env` di root direktori project:
```env
VITE_API_URL="http://localhost:5000"
```
*(Sesuaikan URL di atas dengan alamat server backend Carwash Anda)*

### 4. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di: `http://localhost:5173`

### 5. Build untuk Produksi
```bash
npm run build
```

---

## 🔑 Default Login Admin

Sesuai akun bawaan backend:
```text
Email    : admin@carwash.com
Password : admin123
```

---

## 📜 License

This project is developed for educational and portfolio demonstration purposes.
