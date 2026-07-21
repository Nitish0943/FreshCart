# 🛒 FreshCart — Grocery Delivery Management System

A production-ready, highly performant **Grocery Delivery & Logistics Management Web Application** built with Next.js 15, Turbopack, Tailwind CSS, TanStack Query, and Drizzle ORM.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Deployment (Vercel)](#-deployment-vercel)
- [Performance Optimizations](#-performance-optimizations)
- [License](#-license)

---

## 🌟 Overview

FreshCart provides an end-to-end grocery shopping and logistics fulfillment ecosystem with three distinct role-based experiences:

1. **Customer Web Store**: Product browsing, category filtering, search, dynamic cart management, address book, checkout, and real-time order tracking.
2. **Admin Operations Dashboard**: Catalog management (products & categories), order state machine controls, delivery batching, rider assignments, and analytics metrics.
3. **Rider / Delivery Portal**: Driver availability toggle (Active/Offline persistence), batch assignment execution, order picking, dispatch management, and delivery completion lifecycle.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS Glassmorphism, Responsive Mobile-First Design
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching & Caching**: [TanStack Query v5](https://tanstack.com/query)
- **Database & ORM**: PostgreSQL / SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: Zod
- **Icons & UI**: Lucide React Icons

---

## ✨ Key Features

### 🛍 Customer Experience
- **Hero & Search**: Interactive banner search with live product lookups.
- **Category Browsing**: Quick filter products by category.
- **Smart Shopping Cart**: Real-time price calculation, item persistence, floating cart summary widget.
- **Multi-Address Book**: Save, edit, and select default delivery addresses.
- **Multi-Payment Gateway Options**: Cash on Delivery (COD), Card, and UPI.
- **Responsive Layout**: Fully optimized for Mobile, Tablet, and Desktop screens.

### 👔 Admin Management
- **Store Metrics**: Revenue tracking, pending order counts, catalog totals, and client statistics.
- **Order Processing Machine**: Admin controls order status transitions (`RECEIVED` ➔ `PACKING` ➔ `READY`).
- **Batching & Logistics Engine**: Group multiple `READY` orders into a single delivery batch or assign directly to an available rider.
- **Product & Category Inventory**: Add, update, search, and delete catalog items.

### 🛵 Delivery Boy Portal
- **Persistent Online Status**: Riders toggle online/offline state, staying active even while fulfilling orders to receive multiple batches.
- **Batch Logistics**: View assigned batches, mark orders as `DISPATCHED` and `DELIVERED`.

---

## 📂 Project Architecture

```
apps/customer-web/
├── src/
│   ├── app/                    # Next.js App Router routes & loading fallbacks
│   │   ├── admin/              # Admin Dashboard (/admin/dashboard, /admin/orders, etc.)
│   │   ├── cart/               # Shopping Cart Page
│   │   ├── categories/         # Category Listing & Filter Pages
│   │   ├── checkout/           # Checkout & Address Selection
│   │   ├── delivery/           # Rider Portal & Dashboard
│   │   ├── orders/             # Customer Order History & Tracking
│   │   ├── profile/            # User Profile & Address Book
│   │   ├── layout.tsx          # Root Layout (Fonts, Providers, Toast)
│   │   └── page.tsx            # Home Page
│   ├── components/             # Reusable UI components & Navigation
│   ├── db/                     # Drizzle Database Schemas & Client Connection
│   ├── hooks/                  # Custom TanStack Query & Auth Hooks
│   ├── lib/                    # API client utilities
│   ├── providers/              # React Query & Store Providers
│   ├── repositories/           # Data Access Layer (DAL)
│   ├── services/               # Business Logic Layer
│   └── store/                  # Zustand Client Stores (Auth, Cart, Toast)
└── next.config.ts              # Next.js Performance & Image Configurations
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/freshcart-grocery.git
   cd freshcart-grocery/apps/customer-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in `apps/customer-web/`:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/freshcart"

# Application Secrets
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🗄 Database Setup

To push schema changes and seed initial data:

```bash
# Push Drizzle schema to database
npx drizzle-kit push

# (Optional) Open Drizzle Studio database viewer
npx drizzle-kit studio
```

---

## ☁️ Deployment (Vercel)

The easiest way to deploy FreshCart is via **[Vercel](https://vercel.com)**:

### Deployment via Vercel Dashboard

1. Push your code to GitHub/GitLab.
2. Go to **Vercel Dashboard** ➔ **Add New Project**.
3. Select your repository.
4. Set **Root Directory** to `apps/customer-web` (if using a monorepo setup).
5. Add your **Environment Variables** (`DATABASE_URL`, `JWT_SECRET`).
6. Click **Deploy**.

### Deployment via Vercel CLI

```bash
npm i -g vercel
cd apps/customer-web
vercel --prod
```

---

## ⚡ Performance Optimizations

FreshCart is optimized for maximum loading performance:

- **`next/image` Integration**: Responsive image sizing, AVIF/WebP conversion, and blur placeholders (`placeholder="blur"`) for zero Cumulative Layout Shift (CLS).
- **Route-Level Suspense Skeletons**: Content-aware loading UI for every major route group (`/admin`, `/cart`, `/checkout`, `/categories`, `/orders`, `/profile`, `/delivery`).
- **TanStack Query Caching**: 5-minute garbage collection, background refetching on network reconnect, and `keepPreviousData` for instantaneous category switching.
- **Code Splitting & Dynamic Imports**: Excluded heavy development tools from production bundles.
- **Font Optimization**: Google Font preloading with `display: "swap"` to eliminate Flash of Unstyled/Invisible Text (FOIT/FOUT).
- **Mobile-First Responsive Layout**: Drawer navigation, responsive cards, and dynamic grid layouts for all mobile, tablet, and desktop viewports.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
