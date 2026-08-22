# Smart24 Corporate E-Commerce

🌍 **Live site:** [smart24.com](https://smart24.com) *(Update with actual link)*

A comprehensive B2B and B2C corporate e-commerce platform built for scale, performance, and seamless user experience.

![Next.js](https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

## 🎯 Project Description
Smart24 is a modern, full-stack corporate e-commerce application designed to handle both retail and bulk B2B operations. It features a robust Next.js frontend for an optimal, SEO-friendly user experience and a powerful NestJS backend for secure, scalable business logic. The platform differentiates itself by offering features like membership tiers, bulk ordering, quotation requests (RFQ), and advanced administrative controls.

## ✨ Implemented Features

### 🌐 Public Features
- **Product Catalog & Search** — Advanced filtering, categories, and full-text search for seamless product discovery.
- **Flash Sales & Offers** — Time-limited promotions, dynamic pricing rules, and banners.
- **B2B Capabilities** — Dedicated sections for requesting quotations (RFQ) and bulk orders.

### 🔐 Authentication System
- JWT-based authentication using Passport.js.
- Role-based access control (Admin, Customer, Business User).
- Email verification and OTP integration.

### 🛒 Core Functionality
- **Cart & Checkout** — Secure checkout process with Stripe payment integration.
- **Order & Invoice Management** — Automated invoice generation (PDF) and order tracking.
- **Wishlist & Saved Lists** — Allow users to save items for future purchases.
- **Subscriptions & Memberships** — Support for recurring payments and tiered membership benefits.

### 👤 Dashboards / User Roles
**Customer Dashboard:**
- Order history, returns tracking, wishlist, membership status, and support tickets.
**Admin Dashboard:**
- Comprehensive management of users, products, categories, orders, refunds, and business settings.

## 🛠️ Technology Stack

**Frontend**
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, Shadcn UI, Framer Motion
- **State Management:** Zustand, React Query (@tanstack/react-query)
- **Utilities:** Axios, Zod, React Hook Form

**Backend**
- **Server:** NestJS 11
- **Database ORM:** Prisma
- **Security & Auth:** Passport, JWT, Bcrypt
- **Payments:** Stripe
- **File Handling:** Cloudinary, PDFKit, Multer
- **Caching & Queue:** Cache Manager, Redis

## 📁 Project Structure
```
corporate-ecommerce/
├── apps/
│   ├── frontend/               # Next.js Application
│   │   ├── public/             # Static assets
│   │   ├── src/
│   │   │   ├── app/            # App Router pages and layouts
│   │   │   ├── components/     # Reusable React components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utility functions
│   │   │   └── store/          # Zustand state stores
│   │   └── package.json
│   ├── backend/                # NestJS Application
│   │   ├── prisma/             # Database schema and seeds
│   │   ├── src/
│   │   │   ├── auth/           # Authentication modules
│   │   │   ├── products/       # Product management
│   │   │   ├── orders/         # Order processing
│   │   │   ├── users/          # User management
│   │   │   └── main.ts         # Application entry point
│   │   └── package.json
├── package.json                # Turborepo workspace root
└── turbo.json                  # Turborepo configuration
```

## 🚀 Setup & Installation

**Prerequisites**
- Node.js (v20+)
- pnpm (Package manager)
- PostgreSQL (Database)
- Redis Server
- API Keys: Stripe, Cloudinary, Resend

**Step 1: Clone and Install**
```bash
git clone <repository-url>
cd corporate-ecommerce
pnpm install
```

**Step 2: Environment Variables**
Create `.env` files in both `apps/frontend` and `apps/backend` based on their respective `.env.example` files.

**Step 3: Backend Setup**
```bash
cd apps/backend
npx prisma generate
npx prisma db push
pnpm run dev
```

**Step 4: Frontend Setup**
```bash
cd apps/frontend
pnpm run dev
```

*Alternatively, run the entire workspace from the root using Turborepo:*
```bash
pnpm run dev
```

## 🗺️ Routes Summary

**Frontend Public Routes**
- `/` — Landing page with hero content and featured products
- `/shop` — Main product catalog
- `/flash-sale` — Ongoing promotional sales
- `/business` — B2B portal for bulk orders and quotations

**Frontend Protected Routes**
- `/my-account` — Customer dashboard (Orders, Profile, Wishlist)
- `/admin` — Administrative control panel
- `/checkout` — Secure payment and order confirmation

## 🔧 Development Workflow
- **Frontend URL:** http://localhost:3000
- **Backend API:** http://localhost:4000 (or as configured)
- **Database Studio:** Run `npx prisma studio` in `apps/backend` to view the database.

## 📊 API Reference (optional)
- `/api/auth/*` — Authentication endpoints (Login, Register, Verify)
- `/api/products` — Product catalog management
- `/api/orders` — Order placement and tracking
- `/api/cart` — Shopping cart management

## 🌟 Future Enhancements
- Multi-language and localization support.
- Advanced AI-driven product recommendations.
- Integration with third-party logistics (3PL) providers for real-time shipping rates.

## 📄 License
UNLICENSED (Proprietary software)

---
*Empowering businesses and consumers with a seamless e-commerce experience.*
