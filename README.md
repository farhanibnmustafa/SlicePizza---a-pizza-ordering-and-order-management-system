# 🍕 SlicePizza - Enterprise Pizza Ordering System

SlicePizza is a high-performance, full-stack pizza ordering and management system built for scalability and visual excellence. It features a stunning customer-facing menu, a robust admin dashboard, and seamless payment integration.

## ✨ Core Features

### 🛒 Customer Experience
- **Dynamic Menu**: Real-time pizza selection with premium, locally-hosted artisan photography.
- **Customization**: Granular pizza customization (size, crust, extra toppings).
- **Interactive Map**: Precise delivery location picking using Leaflet and reverse geocoding.
- **Payment Integration**: Secure, enterprise-grade checkout powered by Stripe.
- **Order Tracking**: Stable, UUID-based order history that persists across login/logout sessions.
- **Authentication**: Modern OAuth integration (Facebook, Google) and traditional Credentials support.

### 🛡️ Admin Dashboard
- **Management**: Dedicated interface for managing orders and updating menu items.
- **Real-time Insights**: Visual stats grid for tracking sales and order volume.
- **Security**: Role-Based Access Control (RBAC) ensuring only authorized staff can access `/admin`.
- **System Maturity**: Optimized routing using the Next.js 16 `proxy.ts` convention.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Proxy Convention)
- **Language**: TypeScript (Strict Typing)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with custom `next_auth` schema)
- **Authentication**: [Auth.js v5](https://authjs.dev/) (with Supabase Adapter)
- **Payments**: [Stripe SDK](https://stripe.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: Vitest (Unit) & Playwright (E2E)

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd SlicePizza
npm install
```

### 2. Environment Configuration
Create a `.env.local` file by copying `.env.example`:
```bash
cp .env.example .env.local
```
Key variables required:
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY`
- `AUTH_SECRET` / `FACEBOOK_CLIENT_ID` / `GOOGLE_CLIENT_ID`
- `ADMIN_EMAILS` (Comma-separated list of admin users)

### 3. Database Setup (Supabase)
Run the migration scripts provided in `/supabase/migrations`:
- `20260324000000_menu_and_rbac.sql`: Core schema and initial menu.
- `20260325000001_next_auth_schema.sql`: Official Auth.js schema for persistent identity.

> [!IMPORTANT]
> Ensure the `next_auth` schema is added to your Supabase "Exposed schemas" in project settings.

### 4. Run Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your premium pizza platform in action.

## 📝 Available Scripts

- `npm run dev`: Start development server.
- `npm run build`: Create optimized production build.
- `npm run lint`: Run ESLint for code quality checks.
- `npm run test`: Execute Vitest unit tests.
- `npm run test:e2e`: Run full Playwright smoke suite (against production build).

## 🛡️ Enterprise Standards
- **Middleware Migration**: Fully compliant with Next.js 16 `proxy.ts` standards.
- **Identity Stability**: Uses UUID-based attribution to prevent order history fragmentation.
- **Asset Reliability**: Locally-hosted premium assets to avoid external 404 dependencies.
- **Audit Ready**: Built-in schema for high-precision audit logging.
