# FoodieExpress — Online Food Ordering Web Application

A premium, production-ready, full-stack Online Food Ordering Web Application built from scratch using Next.js 14, TypeScript, TailwindCSS, MongoDB, and Stripe payments. The application supports dual-language localization (English and Arabic) with bidirectional RTL layout support.

## 🚀 Features

- **Responsive & Modern UI**: Sleek glassmorphism design with premium typography, curated colors, and micro-animations.
- **Dual-Language & RTL**: Full internationalization (`next-intl`) supporting English (LTR) and Arabic (RTL).
- **Authentication**: JWT-based secure auth stored in HTTP-only cookies with access & refresh tokens.
- **Cart Management**: State-managed cart (Zustand) with local storage persistence and slide-out Drawer.
- **Stripe Payments**: Real-time Stripe Elements card processing + Cash on Delivery option.
- **Admin Dashboard**: Real-time business overview, order management, status updates, and full product CRUD.
- **Orders Tracking**: Order tracking with expandable status steppers and real-time state badges.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Database**: MongoDB Atlas + Mongoose ODM
- **Payments**: Stripe Node SDK + Stripe React SDK
- **Internationalization**: `next-intl`
- **Validation**: Zod + React Hook Form

---

## 📁 Project Structure

```text
├── app/
│   ├── [locale]/             # Localized routes (en/ar)
│   │   ├── admin/            # Admin dashboard
│   │   ├── checkout/         # Checkout page (Stripe Elements)
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── orders/           # Customer orders and tracking page
│   │   └── page.tsx          # Menu / Home page
│   ├── api/                  # Express-style API endpoints
│   │   ├── auth/             # Login, logout, register, me APIs
│   │   ├── orders/           # Order creation & list APIs
│   │   ├── payments/         # Stripe checkout & webhook APIs
│   │   └── products/         # Products CRUD APIs
│   ├── globals.css           # Custom CSS & Glassmorphism styles
│   └── layout.tsx            # Global layout wrapper
├── components/               # Shared reusable components
│   ├── Navbar.tsx            # Bidirectional localized navbar
│   ├── CartDrawer.tsx        # Cart checkout slider
│   ├── StatusStepper.tsx     # Order tracking stepper
│   ├── StatusBadge.tsx       # Tailwind-colored status tags
│   └── LoadingSkeleton.tsx   # Loading placeholders
├── lib/                      # Core backend utilities
│   ├── db.ts                 # MongoDB connection caching
│   ├── middleware/           # JWT verification middlewares
│   └── models/               # Mongoose Schemas (User, Product, Order)
├── messages/                 # Localized JSON dictionaries
│   ├── en.json               # English translations
│   └── ar.json               # Arabic translations
├── store/                    # Frontend client state
│   ├── authStore.ts          # Auth state + sync
│   └── cartStore.ts          # Cart list + total sync
├── scripts/                  # Seed scripts
│   └── seed.ts               # Database populator
├── package.json              # Script tasks and dependencies
└── tsconfig.json             # TypeScript configuration
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (you can copy `.env.example` as a template):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Seed the Database
Populate your MongoDB database with premium menu items and default users:
```bash
npm run seed
```

This will create:
- **Admin account**: `admin@foodie.com` / `admin12345password`
- **Customer account**: `user@foodie.com` / `user12345password`
- **15+ Premium menu items** (Burgers, Pizzas, Drinks, Desserts, Salads) using high-resolution Unsplash URLs.

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💳 Stripe Webhook Testing

To test Stripe online payments, use the Stripe CLI to forward events:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```
Copy the webhook signing secret returned by Stripe CLI into `STRIPE_WEBHOOK_SECRET` inside `.env.local`.
