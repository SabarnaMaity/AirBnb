# AirBnb (Go-Went-Gone)

A full-stack, multi-tenant vacation rental and accommodation platform built with **Next.js 16 (React 19, Ant Design)**, **Express.js (TypeScript, Typegoose)**, and **MongoDB**.

---

## 🌟 Key Architecture & Highlights

- **3 Dedicated Role-Based Portals:**
  - **Guest / User Portal (`/user`):** Real-time stays discovery, in-app digital wallet deductions, instant booking, wishlist, notifications, and instant refund requests.
  - **Host / Merchant Portal (`/merchant`):** Property registration, room unit inventory creation, photo gallery management, availability controls, and guest checkout release.
  - **Super Administrator Portal (`/admin`):** Platform revenue analytics (15% platform commission cut), property verification approvals, user/host directory, and withdrawal request auditing.
- **Financial & Settlement Lifecycle Engine:**
  - In-app digital wallet transactions (deposit & withdraw).
  - 15% platform commission automatically calculated upon guest checkout and logged into `CommissionModel`.
  - 85% net earnings credited to the property wallet upon departure.
  - Instant pre-settlement refund pipeline returning 100% of the funds to the guest wallet.
- **Generic OOP Backend Design:**
  - Reusable `BaseController<T>` and `BaseService<T>` design pattern in Express & TypeScript.
  - Auto-seeding mechanism for demo guests, hosts, admin, properties, and rooms.

---

## 🚀 Getting Started

### 1. Setup Backend (`Go-Went-Gone`)
```bash
cd Go-Went-Gone
npm install
npm run dev
# Backend runs on http://localhost:3000
```

### 2. Setup Frontend (`frontend`)
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3001
```

Open your browser at **[http://localhost:3001](http://localhost:3001)**.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Target Dashboard |
| :--- | :--- | :--- | :--- |
| 👤 **Guest (User)** | `rahul@example.com` | `password123` | `/user` |
| 🏨 **Host (Merchant)** | `host@example.com` | `password123` | `/merchant` |
| 🛡️ **Super Admin** | `admin@example.com` | `password123` | `/admin` |
