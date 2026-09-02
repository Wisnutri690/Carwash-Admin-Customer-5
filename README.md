# 🚗 APEX. Carwash Management System (Fullstack 5)

Aplikasi Fullstack Carwash Management System modern dengan arsitektur **Dual-Role** (*Customer Self-Service Portal & Admin/Kasir Management Portal*), dilengkapi dengan pelacakan antrean cerdas secara realtime (**Socket.IO**) dan integrasi pembayaran gateway (**Midtrans Snap & Webhook**).

---

## 🛠️ Tech Stack

### Backend
* **Runtime**: Node.js & TypeScript
* **Framework**: Express.js
* **Database**: PostgreSQL
* **ORM**: Prisma ORM
* **Realtime Engine**: Socket.IO
* **Payment Gateway**: Midtrans Client SDK (Snap & Webhook Notification)
* **Validation & Security**: Zod, JWT (JSON Web Token), Bcrypt

### Frontend
* **Core**: React 19 & TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS v4 + Lucide React Icons
* **Routing**: React Router DOM (v7)
* **HTTP Client**: Axios
* **Realtime Client**: Socket.IO Client
* **Payment SDK**: Midtrans Snap.js

---

## 📁 Project Structure

```text
Carwash-Fullstack5/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── Config/
│   │   │   ├── midtrans.ts
│   │   │   ├── prisma.ts
│   │   │   └── socket.ts
│   │   ├── Controllers/
│   │   │   ├── authControllers.ts
│   │   │   ├── customerControllers.ts
│   │   │   ├── orderControllers.ts
│   │   │   ├── paymentControllers.ts
│   │   │   ├── serviceControllers.ts
│   │   │   ├── staffControllers.ts
│   │   │   └── vehicleControllers.ts
│   │   ├── Middlewares/
│   │   │   ├── authMiddlewares.ts
│   │   │   └── middlewaresValidation.ts
│   │   ├── Routes/
│   │   │   ├── CustomerSelfRoute/
│   │   │   │   ├── orderRoute.ts
│   │   │   │   ├── profileRoute.ts
│   │   │   │   └── vehicleRoute.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── customerRoutes.ts
│   │   │   ├── indexRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── paymentRoute.ts
│   │   │   ├── serviceRoutes.ts
│   │   │   ├── staffRoutes.ts
│   │   │   └── vehicleRoutes.ts
│   │   ├── Services/
│   │   │   ├── CustomerSelfService/
│   │   │   │   ├── orderLayers.ts
│   │   │   │   ├── profileLayers.ts
│   │   │   │   └── vehicleLayers.ts
│   │   │   ├── authlayers.ts
│   │   │   ├── customerLayers.ts
│   │   │   ├── orderLayers.ts
│   │   │   ├── paymentLayers.ts
│   │   │   ├── servicesLayers.ts
│   │   │   ├── staffLayers.ts
│   │   │   └── vehicleLayers.ts
│   │   ├── Validations/
│   │   │   ├── authValidation.ts
│   │   │   ├── orderValidation.ts
│   │   │   ├── paymentValidation.ts
│   │   │   └── serviceValidation.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── config/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── pages/
│   │   │   ├── CustomerPortal/
│   │   │   │   └── CustomerPortal.tsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── Login/
│   │   │   │   └── Login.tsx
│   │   │   └── Orders/
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── portalCustomer.ts
│   │   │   └── snapCustomer.ts
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 👥 Dual-Role Architecture & User Journey

### 🚗 1. Sisi Customer (Portal Mandiri - Luxury Studio Theme)
1. **Autentikasi Email (Instant Passwordless)**: Customer dapat login/registrasi hanya menggunakan email terdaftar.
2. **Vehicle Management**: Customer dapat mendaftarkan mobil, mengedit data kendaraan, dan menghapus mobil milik sendiri.
3. **Booking Mandiri & Anti-Double Booking**: Customer memilih mobil dan layanan cuci. Sistem secara otomatis memvalidasi agar mobil yang masih dalam antrean aktif tidak bisa dibooking ulang.
4. **Live FIFO Queue Tracking**: Memantau posisi antrean (`queuePosition`), mobil di depan (`ahead`), dan estimasi waktu selesai (`estimatedMinutes`) secara realtime.
5. **Pembayaran Midtrans Snap**: Melakukan pembayaran online langsung melalui pop-up Midtrans Snap (QRIS, VA BCA/Mandiri/BNI/BRI, GoPay).
6. **Riwayat & Invoice Digital**: Melihat histori pesanan yang telah selesai dan membuka modal invoice resmi (`INV-YYYYMMDD-ID`) yang dapat dicetak.
7. **Pembatalan Mandiri**: Customer dapat membatalkan pesanan secara mandiri selama status masih `WAITING`.

### ⚡ 2. Sisi Admin & Kasir (Management Portal)
1. **Autentikasi Admin Terproteksi**: Login aman dengan email dan password terenkripsi Bcrypt + JWT Role Guard.
2. **Order & Queue Management**: Memantau seluruh antrean, mengubah status pesanan (`WAITING` ➔ `IN_PROGRESS` ➔ `COMPLETED`), dan menugaskan staf pencucian (`staffId`).
3. **Kasir & Billing**: Memproses pembayaran tunai/offline (`CASH`, `QRIS`, `TRANSFER`), mengubah status ke `PAID`, dan mencetak invoice digital.
4. **Master Data Management**: Mengelola Layanan (Services), Staf Teknisi (8 staf: 7 aktif, 1 non-aktif), Data Customer, dan Kendaraan.

---

## 🔄 Realtime Socket.IO Integration

Sistem menggunakan WebSocket (Socket.IO) untuk sinkronisasi data seketika antara Admin dan Customer:
* `ORDER_STATUS_UPDATED`: Dipancarkan ketika status order berubah (`WAITING`, `IN_PROGRESS`, `COMPLETED`, `PAID`).
* Frontend customer dan admin mendengarkan event ini dan langsung memperbarui tampilan antrean secara instan tanpa perlu me-refresh halaman web.

---

## 💳 Midtrans Payment Flow

```text
Customer Klik Bayar di Portal
            ↓
Backend Request Snap Token (`POST /api/payments/snap/:id`)
            ↓
Pop-up Midtrans Snap Muncul di Browser
            ↓
Customer Bayar (QRIS / Virtual Account / GoPay)
            ↓
Midtrans Server Mengirim Webhook Notification (`POST /api/payments/notification`)
            ↓
Backend Memvalidasi Payload & Settlement Status
            ↓
Database Order Diubah Menjadi PAID & Invoice Resmi Otomatis Dibuat
            ↓
Socket.IO Memancarkan Event `ORDER_STATUS_UPDATED` ➔ UI Berubah Seketika!
```

---

## 🗄️ Database Schema & Relations (Prisma + PostgreSQL)

```text
Admin
  └── Order

Staff
  └── Order

Customer
  ├── Vehicle
  └── Order

Vehicle
  └── Order

Order
  ├── OrderItem ── Service
  └── Invoice
```

---

## 🚀 Panduan Menjalankan Project (Installation)

### 1. Clone Repository & Setup Environment
```bash
git clone <repository-url>
cd Carwash-Fullstack5
```

### 2. Setup Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   npm install
   ```
2. Buat file `.env` di dalam folder `backend`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/carwash_db?schema=public"
   JWT_SECRET="your_super_secret_jwt_key"

   MIDTRANS_IS_PRODUCTION=false
   MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"
   MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"
   ```
3. Jalankan migrasi database & seeding data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. Jalankan backend development server:
   ```bash
   npm run dev
   ```
   *Backend running on http://localhost:3000*

### 3. Setup Frontend
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Pastikan file `index.html` memuat script Midtrans Snap SDK:
   ```html
   <script type="text/javascript"
     src="https://app.sandbox.midtrans.com/snap/snap.js"
     data-client-key="SB-Mid-client-xxxxxxxxxxxx">
   </script>
   ```
3. Jalankan frontend development server:
   ```bash
   npm run dev
   ```
   *Frontend running on http://localhost:5173*

---

## 🔑 Akun Demo (Default Seed Data)

### 👑 Admin / Kasir
* **Email**: `admin@carwash.com`
* **Password**: `admin123`

### 🚗 Customer Demo
* **Email**: `dennis.gtr@nismo.id` (Mobil: Nissan GT-R Nismo)
* **Email**: `kevin.sanjaya@apexmotors.id` (Mobil: BMW M4 Competition)
* **Email**: `arya.wicaksana@apexgarage.id` (Mobil: Porsche 911 GT3 RS)
* **Email**: `jessica.tan@supercar.co.id` (Mobil: Ferrari SF90 Stradale)

---

## 📜 License
Project ini dikembangkan untuk kebutuhan pembelajaran dan portofolio Fullstack Carwash Management System.
