# 🚗 Carwash Backend

Backend REST API untuk sistem manajemen carwash yang digunakan untuk mengelola customer, vehicle, service, staff, order, authentication, payment, dan invoice.

## 🛠️ Tech Stack

* Node.js
* TypeScript
* Express.js
* PostgreSQL
* Prisma ORM
* Zod
* JWT
* Bcrypt

## 📁 Project Structure

```text
carwash/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── Config/
│   │   └── prisma.ts
│   │
│   ├── Controllers/
│   │   ├── authControllers.ts
│   │   ├── customerControllers.ts
│   │   ├── orderControllers.ts
│   │   ├── serviceControllers.ts
│   │   ├── staffControllers.ts
│   │   └── vehicleControllers.ts
│   │
│   ├── Middlewares/
│   │   ├── authMiddlewares.ts
│   │   └── middlewaresValidation.ts
│   │
│   ├── Routes/
│   │   ├── authRoutes.ts
│   │   ├── customerRoutes.ts
│   │   ├── indexRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── serviceRoutes.ts
│   │   ├── staffRoutes.ts
│   │   └── vehicleRoutes.ts
│   │
│   ├── Services/
│   │   ├── authlayers.ts
│   │   ├── customerLayers.ts
│   │   ├── orderLayers.ts
│   │   ├── servicesLayers.ts
│   │   ├── staffLayers.ts
│   │   └── vehicleLayers.ts
│   │
│   ├── Validations/
│   │   ├── authValidation.ts
│   │   ├── customerValidation.ts
│   │   ├── orderValidation.ts
│   │   ├── paymentValidation.ts
│   │   ├── serviceValidation.ts
│   │   ├── staffValidation.ts
│   │   └── vehicleValidation.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .gitignore
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## 🔐 Authentication

Authentication menggunakan JWT.

Login:

```http
POST /auth/login
```

Request body:

```json
{
  "email": "admin@carwash.com",
  "password": "admin123"
}
```

Setelah login berhasil, API akan memberikan JWT token.

Endpoint selain login membutuhkan:

```http
Authorization: Bearer <token>
```

## 📌 Main Features

### Authentication

* Admin login
* Password hashing menggunakan bcrypt
* JWT authentication
* Protected API routes

### Customer

* Create customer
* Get all customers
* Get customer by ID
* Update customer
* Delete customer

### Vehicle

* Create vehicle
* Get all vehicles
* Get vehicle by ID
* Update vehicle
* Delete vehicle

### Service

* Create service
* Get all services
* Get service by ID
* Update service
* Delete service

### Staff

* Get all staff
* Update staff active/inactive status

### Order

* Create order
* Get all orders
* Get order by ID
* Update order
* Delete order
* Assign staff to order
* Validate customer and vehicle ownership
* Validate active staff
* Calculate total order automatically

### Payment & Invoice

* Process payment
* Payment methods:

  * QRIS
  * CASH
  * TRANSFER
* Update payment status
* Automatically generate invoice after successful payment
* Retrieve invoice by order

## ✅ Validation

Request validation menggunakan Zod.

Validation tersedia untuk:

* Authentication
* Customer
* Vehicle
* Service
* Staff
* Order
* Payment

Alur request:

```text
Client
  ↓
Authentication
  ↓
Zod Validation
  ↓
Controller
  ↓
Service Layer
  ↓
Prisma
  ↓
PostgreSQL
```

## 🗄️ Database

Database menggunakan PostgreSQL dengan Prisma ORM.

Model utama:

```text
Admin
Staff
Customer
Vehicle
Service
Order
OrderItem
Invoice
```

Relasi utama:

```text
Customer
   └── Vehicle

Customer
   └── Order

Vehicle
   └── Order

Admin
   └── Order

Staff
   └── Order

Order
   ├── OrderItem
   │      └── Service
   │
   └── Invoice
```

## 🚀 Installation

Clone repository:

```bash
git clone <repository-url>
```

Masuk ke project:

```bash
cd carwash
```

Install dependencies:

```bash
npm install
```

Buat file `.env`:

```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
```

Jalankan migration:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan seed:

```bash
npx prisma db seed
```

Jalankan development server:

```bash
npm run dev
```

## 🔑 Default Admin

Admin hasil seed:

```text
Email    : admin@carwash.com
Password : admin123
```

> Untuk production, gunakan password dan secret yang aman dan jangan commit file `.env`.

## 🧪 API Testing

API dapat diuji menggunakan Postman.

Struktur collection:

```text
Carwash API
├── Auth
│   └── Login
├── Customer
├── Vehicle
├── Service
├── Staff
└── Order
```

Semua endpoint selain login membutuhkan JWT authentication.

## 💳 Payment Flow

```text
Create Order
     ↓
WAITING
     ↓
IN_PROGRESS
     ↓
COMPLETED
     ↓
Payment
     ↓
PAID
     ↓
Invoice Generated
```

Payment endpoint:

```http
POST /orders/:id/payment
```

Contoh:

```json
{
  "paymentMethod": "QRIS"
}
```

Invoice dapat diambil menggunakan:

```http
GET /orders/:id/invoice
```

## 📜 License

This project is developed for project/learning purposes.
