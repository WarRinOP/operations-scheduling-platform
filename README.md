# OpsFlow — Operations & Dynamic Scheduling Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

A lightweight, robust **Operations & Dynamic Scheduling Platform** for on-demand field services (auto detailing, mobile mechanics, home repair, technical maintenance). Built with clean database architecture, deterministic finite state transitions, real-time dynamic slot availability calculation, mobile digital signature sign-off, operations dispatch pipeline, and revenue analytics.

---

## 🌟 Core System Highlights

### 1. Strict Deterministic Finite State Machine (FSM)
Enforces a linear lifecycle preventing illegal state jumps:
```
[Pending] ➔ [Scheduled] ➔ [En Route] ➔ [In Progress] ➔ [Completed] ➔ [Billed]
```
- **Pending:** Customer created booking and paid 20% deposit; awaiting technician assignment.
- **Scheduled:** Dispatcher assigned a technician; arrival window locked.
- **En Route:** Technician tapped "Start Trip" on mobile; client arrival SMS/alert fired.
- **In Progress:** Technician arrived on site; active work timer initiated.
- **Completed:** Technician finished tasks and captured client HTML5 digital signature.
- **Billed:** Automated Worker settled final invoice; balance marked paid in full.

### 2. Role-Based Access Control (RBAC)
- **Customer View (`/book` & `/track/[id]`):** 3-Step booking wizard, dynamic 30-min slot selector, 20% upfront deposit checkout, and real-time status tracker.
- **Operations Dispatcher (`/admin/dispatch`):** 6-Column desktop Kanban board, technician assignment modal, filters, and state machine controls.
- **Field Technician Mobile Portal (`/tech/active-job`):** 390px mobile viewport, contextual single-action CTA, on-site live work timer, and digital signature sign-off pad.
- **Admin Revenue Dashboard (`/admin/analytics`):** Gross pipeline (MRR), utilization rate, searchable transactions, printable PDF invoices, and live webhook audit logs.

### 3. Dynamic Slot Availability Engine
Calculates real-time conflict-free slots across operating hours (8:00 AM – 6:00 PM) based on service duration, technician assignments, buffer windows, and existing booking blocks.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/WarRinOP/operations-scheduling-platform.git
cd operations-scheduling-platform
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Production Validation
```bash
npm run build
npm run start
```

---

## 🗄️ Database Architecture (PostgreSQL / Supabase DDL)

The complete SQL schema is located at [`supabase/schema.sql`](./supabase/schema.sql):
- `profiles`: RBAC entities (`customer`, `technician`, `admin`).
- `services`: Dynamic service catalog with pricing and duration.
- `bookings`: Finite state machine records with customer/technician relations.
- `system_event_logs`: Audit trail tracking every transition and webhook payload.

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete operations platform"
   git push origin main
   ```
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. (Optional) Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**!
