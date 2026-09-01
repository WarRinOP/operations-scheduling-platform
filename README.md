# OpsFlow — Operations & Dynamic Scheduling Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

A lightweight, robust **Operations & Dynamic Scheduling Platform** for on-demand field services (automotive detailing, mobile mechanics, technical inspection, and home repair). Engineered with deterministic finite state machine transitions, real-time dynamic slot availability calculation, mobile digital signature sign-off, operations dispatch Kanban, automated CRM webhook alerts, and revenue analytics.

---

## 📁 Repository Structure

```
├── app/                        # Next.js 14 App Router Pages & API Endpoints
│   ├── admin/
│   │   ├── analytics/          # Revenue analytics, productivity table & CSAT
│   │   └── dispatch/           # 6-Column operations dispatch Kanban board
│   ├── api/
│   │   ├── availability/       # Dynamic slot calculation API endpoint
│   │   ├── bookings/           # Booking CRUD & state transition API
│   │   └── webhooks/           # Event-driven CRM alert webhook triggers
│   ├── book/                   # 3-Step customer booking & deposit wizard
│   ├── login/                  # Multi-role persona switching portal
│   ├── tech/active-job/        # 390px Field technician mobile view & signature
│   ├── track/[id]/             # Customer live tracker & automated CRM feed
│   ├── layout.tsx              # Root HTML shell & AppProvider hydration
│   └── page.tsx                # Role-aware overview & home dashboard
├── components/                 # Reusable UI Components & State Guards
│   ├── invoice-modal.tsx       # Itemized printable tax invoice sheet (INV-...)
│   ├── navbar.tsx              # Responsive top navigation with active badges
│   ├── role-guard.tsx          # Client-side RBAC protection wrapper
│   ├── service-card.tsx        # Service package display card
│   └── state-badge.tsx         # Unified FSM state badge styling
├── docs/                       # Project Documentation & Academic Artifacts
│   ├── SRS-2.docx              # Software Requirements Specification (SRS)
│   ├── presentation_slides.pptx# 16:9 Widescreen PowerPoint Presentation
│   ├── presentation_slides.md  # Slide outline, speaker scripts & viva Q&A
│   ├── generate_slides.py      # Automated PPTX slide generation script
│   └── project-context.md      # Technical context & architecture summary
├── lib/                        # Core Domain Logic & Business Rules
│   ├── mock-data.ts            # Seed profiles, service catalog & demo state
│   ├── scheduling.ts           # Dynamic 30-min slot engine with 15-min buffers
│   ├── state-machine.ts        # Strict 6-state FSM transition validator
│   ├── store.tsx               # Reactive application context & local store
│   └── types.ts                # TypeScript domain models & BDT currency helpers
├── supabase/
│   └── schema.sql              # PostgreSQL DDL schema & Row Level Security
└── README.md                   # Project documentation & setup guide
```

---

## 🌟 Core System Highlights

### 1. Strict Deterministic Finite State Machine (FSM)
Enforces a strict linear lifecycle preventing illegal skips or unauthorized role actions:
```
[Pending] ➔ [Scheduled] ➔ [En Route] ➔ [In Progress] ➔ [Completed] ➔ [Billed]
```
- **Pending:** Customer created booking and paid 20% deposit; awaiting dispatcher assignment.
- **Scheduled:** Dispatcher assigned a qualified technician; time slot and zone locked.
- **En Route:** Technician departed and started trip; automated ETA SMS alert dispatched.
- **In Progress:** Technician arrived on site; active work duration timer initiated.
- **Completed:** Work completed; customer inspects work and signs digital signature canvas.
- **Billed:** Autonomous background worker settles invoice and issues official tax bill (`INV-...`).

### 2. Role-Based Access Control (RBAC)
- **Customer Portal (`/book` & `/track/[id]`):** 3-Step booking wizard, dynamic slot selection, 20% deposit checkout, and live progress tracker.
- **Operations Dispatcher (`/admin/dispatch`):** 6-Column Kanban pipeline, skill-based staff allocation, and Dhaka zone proximity filters.
- **Field Technician Mobile Portal (`/tech/active-job`):** 390px mobile layout, top numbered task switcher, live stopwatch timer, and digital sign-off.
- **Admin Operations Dashboard (`/admin/analytics`):** Gross pipeline revenue (BDT), technician productivity table, CSAT feedback ratings, and webhook audit stream.

### 3. Dynamic Slot Engine & Concurrency Locking
Evaluates operating hours (8:00 AM – 6:00 PM), service duration (45 to 180 mins), and adds **15-minute travel & prep buffers** while enforcing transactional concurrency locks (`FR-03`) to eliminate double-bookings.

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

### 3. Production Build & Verification
```bash
npm run build
npm run start
```

---

## 🗄️ Database Architecture (PostgreSQL / Supabase DDL)

The complete SQL schema is located at [`supabase/schema.sql`](./supabase/schema.sql):
- `profiles`: RBAC user accounts (`customer`, `technician`, `admin`).
- `services`: Dynamic service catalog with pricing, duration, and deposit rates.
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
3. Click **Deploy** (No external database connection required for demo mode).
