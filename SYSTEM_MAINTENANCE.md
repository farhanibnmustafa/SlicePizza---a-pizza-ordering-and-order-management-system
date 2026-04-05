# SlicePizza - System Architecture & Maintenance Guide

This document provides a comprehensive overview of the SlicePizza platform architecture, alongside operational procedures for maintaining the system, managing the server, and handling database configurations.

---

## 1. System Architecture

SlicePizza is built using a modern **Hybrid Architecture** combining server-side rendering (SSR), static generation (SSG) via Edge Cache, and client-side react interactions. The system is designed for high performance, utilizing multiplexed HTTP/2 routing and granular DOM rendering.

### Tech Stack
- **Framework**: Next.js 16.2 (App Router) + React 19
- **Authentication**: NextAuth.js v5 with Supabase Adapter
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe API
- **State Management**: Zustand
- **Mailing**: Resend & NodeMailer
- **Testing**: Vitest (Unit) & Playwright (E2E Tests)
- **Mapping/Tracking**: Leaflet & React-Leaflet
- **Deployment Platform**: Vercel Edge Network

---

## 2. Server & Deployment Maintenance

Because SlicePizza is explicitly deployed on **Vercel**, you do not maintain a traditional "bare-metal" server (like a Linux VPS). Vercel operates using "Serverless Functions" and "Edge CDN". 

### General Deployment
- **Pushing Updates**: Merging code to the `main` branch via GitHub will automatically trigger a Vercel build and deploy.
- **Rollbacks**: If a bug breaks production, log into the Vercel Dashboard, find the previous successful deployment in the "Deployments" tab, and click **Promote to Production** / Revert. This is instant.

### Caching and Edge Invalidation
- The system heavily utilizes aggressive caching for static assets (images, SVGs, Next.js chunks) utilizing `Cache-Control: public, max-age=31536000, immutable`.
- We utilize `next/font` for zero-latency typography and `gzip`/`brotli` for compressed payload delivery.
- If you update an image or static asset and it doesn't appear live, you may need to force cache invalidation on Vercel or rename the asset structurally (Cache Busting).

### Monitoring Performance
> Use Vercel's **Analytics** and **Speed Insights** tabs periodically to monitor Core Web Vitals (LCP, FID, CLS) and detect any server-side rendering bottlenecks on the API routes.

---

## 3. Database Maintenance (Supabase)

Supabase handles the core PostgreSQL database. 

### Running Migrations
Any updates to tables, policies, or RBAC (Role Based Access Control) should be handled via SQL migrations in the `supabase/migrations/` directory.
1. Run local migrations using the Supabase CLI: `supabase migration up`.
2. Do not edit table structures manually through the dashboard in production; always use migration scripts to maintain schema integrity and version control.

### Handling Audit Logs
- The system includes table configurations for `audit_logs` (configured in `20260324000001_audit_logs.sql`). 
- **Clearance Policy**: Database space is finite. Establish a routine (or a database backend cron trigger) to prune or archive audit logs older than 90 days.

---

## 4. Routine Security & Updates

> **WARNING**: Node.js dependencies become deprecated quickly. Delaying updates can result in severe security vulnerabilities.

### Updating Packages
Run dependency updates securely every quarter:
```bash
# Check for outdated packages
npm outdated

# Update securely within semantic versioning limits defined in package.json
npm update

# For major framework upgrades, rely on explicit installation
npm install next@latest react@latest react-dom@latest
```

### Environment Variables (.env)
- Keep your production keys strictly inside Vercel's **Environment Variables** dashboard. 
- Never commit actual Stripe Secret Keys or Supabase Service Role keys to GitHub (the `.env.local` is git-ignored).
- If an employee leaves, **rotate your keys** within Stripe/Supabase and update them in Vercel to preserve system security.

---

## 5. Testing Protocols

Before authorizing any major pull request or push to production, you must verify the local tests pass to prevent user-facing downtime or catastrophic checkout failures.

**Run Local Server**
```bash
npm run dev
```

**Run Unit Tests (Zustand logic, validaters)**
```bash
npm run test
```

**Run E2E Browser Tests (Playwright)**
Crucial to verify checkout pipelines work end-to-end:
```bash
npm run test:e2e
```
