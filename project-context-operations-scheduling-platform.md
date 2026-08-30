# PROJECT CONTEXT: Operations & Dynamic Scheduling Platform

## 1. System Overview & Philosophy
- **Application Type:** Lightweight Operations & Dynamic Scheduling Web Application for on-demand field services (auto detailing, home repair, technical maintenance).
- **Core Philosophy:** Minimal, functional, and strictly aligned with Software Engineering requirements. Clean database architecture, deterministic state transitions, dynamic availability calculation, and role-based views.
- **Tech Stack:** Next.js (App Router), Tailwind CSS, shadcn/ui (minimal components), Supabase / PostgreSQL.

---

## 2. Roles & Access Control (RBAC)
- **Customer:** Browses services, selects dynamic available slots, pays upfront deposits, and tracks service status.
- **Field Technician (Mobile Web View):** Views assigned daily jobs, executes state transitions (`En Route` -> `In Progress` -> `Completed`), and collects on-site digital signatures.
- **Admin / Dispatcher (Desktop Web View):** Oversees the operations pipeline, assigns technicians to pending requests, views revenue metrics, and tracks platform analytics.
- **Automated System Worker:** Dynamic slot availability calculator, concurrency lock manager, and webhook notification dispatcher.

---

## 3. Strict State Machine Lifecycle
The booking lifecycle strictly enforces this linear progression:

`Pending` -> `Scheduled` -> `En Route` -> `In Progress` -> `Completed` -> `Billed`

- **Pending:** Customer created booking and paid deposit; awaiting technician assignment.
- **Scheduled:** Dispatcher assigned a technician; arrival window locked.
- **En Route:** Technician tapped "Start Trip" on mobile; system fires client arrival alert.
- **In Progress:** Technician arrived on site and started work timer.
- **Completed:** Technician finished tasks and captured client digital signature.
- **Billed:** Final invoice generated; balance marked settled.

---

## 4. Database Schema (PostgreSQL / Supabase DDL)

```sql
-- 1. Profiles Table (RBAC)
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin');

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Services Catalog
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    price NUMERIC(10,2) NOT NULL,
    deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00
);

-- 3. Bookings Table (Finite State Machine)
CREATE TYPE job_status AS ENUM (
    'pending', 
    'scheduled', 
    'en_route', 
    'in_progress', 
    'completed', 
    'billed'
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    service_address TEXT NOT NULL,
    status job_status NOT NULL DEFAULT 'pending',
    deposit_amount NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    customer_signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Audit & Webhook Logs
CREATE TABLE system_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status job_status,
    new_status job_status NOT NULL,
    triggered_by UUID REFERENCES profiles(id),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Screen & Functional Breakdown

### Screen 1: Customer Dynamic Booking Portal (`/book`)
**Route:** `/book`

**Layout:** Minimal 3-step desktop/tablet container.

**Features:**
- Service selection list with duration and price.
- Interactive calendar with dynamic slot pills calculated based on existing bookings and technician buffer.
- Checkout box showing 20% deposit amount, card inputs, and primary CTA: `[ Pay Deposit & Confirm Booking ]`.

**Outcome:** Inserts booking record with status `pending`.

### Screen 2: Operations Dispatch & Kanban Board (`/admin/dispatch`)
**Route:** `/admin/dispatch`

**Layout:** Desktop widescreen view with 6 columns (Pending, Scheduled, En Route, In Progress, Completed, Billed).

**Features:**
- Job cards showing customer name, service type, scheduled window, and assigned technician.
- Unassigned cards in Pending include an `[ Assign Staff ]` button that opens a selection modal.
- Top header with date filters, technician filters, and link to `/admin/analytics`.

### Screen 3: Field Technician Mobile Portal (`/tech/active-job`)
**Route:** `/tech/active-job`

**Layout:** Mobile-optimized viewport (390px width).

**Features:**
- Active job container displaying client address, service checklist, and "Open Maps" link.
- Sequential Action Button:
  - If `scheduled`: `[ Start Trip (En Route) ]` -> updates to `en_route`.
  - If `en_route`: `[ Arrived & Start Work ]` -> updates to `in_progress`.
  - If `in_progress`: `[ Complete Job & Collect Signature ]` -> opens sign-off modal.
- Modal with HTML5 canvas signature pad + CTA: `[ Submit Sign-Off & Generate Final Bill ]` -> transitions state to `completed` and settles to `billed`.

### Screen 4: Admin Revenue & Analytics Dashboard (`/admin/analytics`)
**Route:** `/admin/analytics`

**Layout:** Desktop grid dashboard.

**Features:**
- Key KPI cards: Monthly Recurring Revenue (MRR), Total Bookings, Technician Utilization Rate.
- Recent Transactions Table with invoice print/download buttons.
- Live Event Webhook Feed displaying status trigger logs (e.g., WhatsApp/SMS notification emitted).

---

## 6. Development Rules for Code Generation
- **Design System:** Use minimal, clean Tailwind CSS tokens (`bg-slate-900`, `bg-white`, `border-slate-200`, `text-slate-800`). Avoid flashy gradients, heavy decorative illustrations, or unnecessary layout clutter.
- **State Transition Integrity:** Prevent illegal state skips. A job cannot move directly from `pending` to `completed` without passing through the intermediate stages.
- **Modularity:** Separate business logic (state transitions, slot calculations) into reusable helper functions or Supabase RPC calls.
