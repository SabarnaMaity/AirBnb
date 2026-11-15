# Go-Went-Gone (Next.js Multi-Panel with Real MongoDB Connection & Auth)

A complete, production-ready Airbnb-style platform management portal built with **Next.js (App Router)** and **Ant Design (antd)**, fully integrated with your **Express.js & MongoDB** backend!

---

## 🚀 How to Run the Project

### 1. Start the Express Backend (`Go-Went-Gone`)
```bash
cd Go-Went-Gone
npm run dev
# Express Backend starts on http://localhost:3000
```
> **Auto-Seed Feature:** Upon initial startup, the backend checks MongoDB and automatically seeds default demo accounts, a property, and rooms if the database is fresh!

### 2. Start the Next.js Frontend (`frontend`)
```bash
cd frontend
npm run dev
# Next.js App starts on http://localhost:3001
```

Visit: **[http://localhost:3001](http://localhost:3001)**

---

## 🔑 Login & Authentication System

Navigate to **[http://localhost:3001/login](http://localhost:3001/login)**. You can create a new account or use the **One-Click Quick Login** buttons:

| Role | Email | Password | Access Panel |
| :--- | :--- | :--- | :--- |
| 👤 **Guest (User)** | `rahul@example.com` | `password123` | [User Panel (`/user`)](http://localhost:3001/user) |
| 🏨 **Host (Merchant)** | `host@example.com` | `password123` | [Merchant Panel (`/merchant`)](http://localhost:3001/merchant) |
| 🛡️ **Super Admin** | `admin@example.com` | `password123` | [Admin Panel (`/admin`)](http://localhost:3001/admin) |

---

## 🏢 3 Dedicated Portals (Connected to Live MongoDB)

### 1. User Panel (`/user`)
- **Live Room Catalog:** Fetches rooms directly from MongoDB (`GET /api/merchant/room/getall`).
- **Instant Booking:** Calculates total price (duration × nightly rate) and checks wallet balance before booking (`POST /api/user/booking`).
- **Digital Wallet:** Deposit funds (`POST /api/user/add-wallet`), withdraw funds to bank (`POST /api/user/withdraw`), and view live wallet balance.
- **Wishlist:** Save/remove rooms to favorites list (`POST /api/user/like`).
- **Instant Refund:** Full wallet refund for bookings awaiting checkout (`PUT /api/user/refund`).
- **Notifications Drawer:** Real-time notifications synced with MongoDB (`GET /api/user/notification/get-all`).

### 2. Merchant Panel (`/merchant`)
- **Property Profile:** View hotel/resort details, location, bank account information, and toggle property `OPEN` / `CLOSED` (`PUT /api/merchant/update/:_id`).
- **Room Creation:** Add rooms with room number, price/night, services (WiFi, AC, Geyser, etc.), and tags (`POST /api/merchant/room/create`).
- **Gallery Management:** Push photo URLs directly to room listings (`PUT /api/merchant/room/add-image`).
- **Guest Checkout & Settlement:** Complete checkout (`PUT /api/user/payment-send`), which transfers **85%** of the booking bill to the property's wallet and releases the room.

### 3. Admin Panel (`/admin`)
- **Financial Ledger:** Tracks the **15% platform commission** collected from all guest checkouts (`CommissionModel`).
- **Property Verification:** Review and verify/approve merchant properties (`PUT /api/merchant/update/:_id`).
- **User Directory:** Audit all registered guests, hosts/merchants, and admins along with their wallet balances (`GET /api/user/get`).
- **Withdrawal Requests:** Monitor withdrawal payouts initiated by users (`WithdawModel`).
