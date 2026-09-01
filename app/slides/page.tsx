'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Layers, 
  Home, 
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Printer
} from 'lucide-react';

interface SlideData {
  id: number;
  category: string;
  title: string;
  subtitle?: string;
  isDark?: boolean;
  content: React.ReactNode;
  speakerNotes: string;
}

export default function SlidesPresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides: SlideData[] = [
    // SLIDE 1: Title
    {
      id: 1,
      category: 'AIUB • Software Engineering • Section DD • Group H',
      title: 'Agentic Operations & Dynamic Scheduling Platform for Field Services',
      subtitle: 'Solving Double-Booking, Field Dispatch Inefficiencies & Revenue Leakage using Finite State Automation',
      isDark: true,
      speakerNotes: 'Good day faculty and peers. We present Group H\'s capstone project: Agentic Operations and Dynamic Scheduling Platform for Field Services, developed under the supervision of Sourav Akib Sarkar.',
      content: (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-2 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Supervised By
              </span>
              <h4 className="text-base font-bold text-white">Sourav Akib Sarkar</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Faculty of Science & Technology<br />
                Dept. of Computer Science, AIUB
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-2 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Development Team (Group H)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
                <div>1. Abrar Tajwar Khan<br /><span className="text-[10px] text-slate-500">24-57356-2</span></div>
                <div>2. Ahmed Aahan Addin<br /><span className="text-[10px] text-slate-500">24-57325-2</span></div>
                <div>3. Lasker Sifwat Hossein<br /><span className="text-[10px] text-slate-500">24-57368-2</span></div>
                <div>4. Sadnan Shahad<br /><span className="text-[10px] text-slate-500">24-57524-2</span></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // SLIDE 2: Problem Statement
    {
      id: 2,
      category: 'Problem Statement',
      title: 'The Real-World Operational Dilemma in Field Services',
      subtitle: 'Manual coordination causes severe friction in urban doorstep operations (Dhaka)',
      speakerNotes: 'In field operations, over 60% of time is wasted due to fragmented communication. Double bookings, customer no-shows after travel, blind dispatching, and manual revenue leakage are the 4 core problems we target.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {[
            {
              num: '01',
              title: 'Double-Booking & Schedule Collisions',
              desc: 'Manual phone calls and WhatsApp chats result in overlapping customer bookings, unoptimized schedule gaps, and technician idle time.',
            },
            {
              num: '02',
              title: 'High Customer No-Show Rates',
              desc: 'Without upfront commitment and automated arrival notifications, customers cancel last-minute after technicians have traveled through traffic.',
            },
            {
              num: '03',
              title: 'Blind Resource Dispatching',
              desc: 'Dispatchers lack real-time visibility into staff skill sets, active availability, and geographic location buffers.',
            },
            {
              num: '04',
              title: 'Manual Revenue Leakage',
              desc: 'Delayed paper invoicing, unrecorded cash balances, and lack of verified proof-of-work lead to disputed payments.',
            },
          ].map((item) => (
            <div key={item.num} className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Problem {item.num}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 3: System Solution & Architecture
    {
      id: 3,
      category: 'System Architecture',
      title: 'Our Solution: 3 Portals + 1 Autonomous Engine',
      subtitle: 'A synchronized real-time operations and dynamic scheduling ecosystem',
      speakerNotes: 'Our platform connects three dedicated portals into a synchronized real-time system: Customer booking with deposits, Operations Dispatch Kanban, and Field Technician mobile sign-off.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            {
              title: 'Customer Portal',
              route: '/book • /track',
              items: [
                'Dynamic 30-min slot calendar',
                '15-minute travel buffers',
                '20% upfront deposit checkout',
                'Real-time status & ETA tracking',
              ],
              color: 'border-emerald-200 bg-emerald-50/40 text-emerald-950',
            },
            {
              title: 'Operations Dispatcher',
              route: '/admin/dispatch',
              items: [
                '6-Column Kanban pipeline',
                'Skill-based staff allocation',
                'Dhaka zone proximity matching',
                'Concurrency lock verification',
              ],
              color: 'border-purple-200 bg-purple-50/40 text-purple-950',
            },
            {
              title: 'Field Technician Portal',
              route: '/tech/active-job',
              items: [
                '390px responsive mobile layout',
                'Top numbered task switcher',
                'Live on-site work timer',
                'HTML5 digital client signature',
              ],
              color: 'border-blue-200 bg-blue-50/40 text-blue-950',
            },
          ].map((portal, idx) => (
            <div key={idx} className={`rounded-xl border p-5 text-left shadow-xs space-y-3 ${portal.color}`}>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase opacity-60">
                  {portal.route}
                </span>
                <h4 className="text-sm font-bold mt-0.5">{portal.title}</h4>
              </div>
              <ul className="space-y-1.5 text-xs">
                {portal.items.map((it, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-1.5">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 4: Actors & Roles
    {
      id: 4,
      category: 'Actors & Roles',
      title: 'System Actors & Role Responsibilities (SRS Alignment)',
      subtitle: '3 Human Login Personas (RBAC) + 1 Autonomous System Actor',
      speakerNotes: 'In our SRS, we define 3 human login personas and 1 automated system actor: the AI Scheduling Agent that autonomously evaluates calendar states, enforces race condition locks, and settles invoices.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {[
            {
              role: 'Customer (Tanvir Ahmed)',
              type: 'HUMAN ACTOR',
              desc: 'Initiates bookings (UC-01), pays upfront deposits online (US-02), tracks real-time progress & ETA (UC-02), and accesses historical receipts (UC-03).',
            },
            {
              role: 'Field Technician (Kazi Shakil)',
              type: 'HUMAN ACTOR',
              desc: 'Receives assigned tasks on mobile portal, advances linear states (UC-06), navigates via maps, tracks work time, and captures digital signatures (NFR-04).',
            },
            {
              role: 'Admin / Dispatcher (Tajwar Hossain)',
              type: 'HUMAN ACTOR',
              desc: 'Matches staff by skills and Dhaka zone (UC-05), manages the Kanban pipeline (US-05), and monitors revenue analytics & CSAT (UC-08, UC-09).',
            },
            {
              role: 'AI Scheduling Agent (Background Worker)',
              type: 'SYSTEM ACTOR (4th in SRS)',
              desc: 'Evaluates calendar states to compute valid slots (UC-04), enforces concurrency locking (FR-03), and auto-settles invoices upon sign-off (FR-07).',
              highlight: true,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 text-left shadow-xs space-y-1.5 ${
                item.highlight ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${item.highlight ? 'text-emerald-700 font-mono' : 'text-slate-400'}`}>
                {item.type}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.role}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 5: Scrum Methodology
    {
      id: 5,
      category: 'Software Engineering Methodology',
      title: 'Agile Scrum Development Lifecycle',
      subtitle: 'Iterative delivery across 4 sprints with continuous validation',
      speakerNotes: 'We adopted the Scrum framework to build this system iteratively. Product backlog items were derived directly from SRS requirements and delivered in 4 two-week sprint increments.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {[
            {
              step: '01',
              title: 'Why Scrum?',
              desc: 'Allowed iterative delivery across 4 sprints, continuous requirement traceability against SRS-2, and frequent UI/UX refinement.',
            },
            {
              step: '02',
              title: 'Product Backlog',
              desc: 'Structured user stories directly mapped to functional requirements FR-01 through FR-08 with clear acceptance criteria.',
            },
            {
              step: '03',
              title: 'Sprint Ceremonies',
              desc: 'Conducted bi-weekly Sprint Planning, daily peer standups, sprint reviews, and retrospective code audits.',
            },
            {
              step: '04',
              title: 'Burndown & Quality',
              desc: 'Monitored velocity, enforced zero build/lint errors (npm run build), and validated 100% route health.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs space-y-2">
              <span className="text-base font-black text-emerald-600 font-mono">{item.step}</span>
              <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 6: 4 Sprints Breakdown
    {
      id: 6,
      category: 'Scrum Execution',
      title: '4-Sprint Incremental Lifecycle Breakdown',
      subtitle: 'From schema architecture to autonomous settlement engine',
      speakerNotes: 'Across Sprint 1 through 4, we transitioned from database architecture to slot calculations, then to the dispatch Kanban and mobile portal, and finally to automated CRM alerts, invoicing, and analytics.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {[
            {
              sprint: 'Sprint 1 (Weeks 1-2)',
              goal: 'Architecture & Schema Foundations',
              items: ['SRS requirement analysis & schema DDL', 'RoleGuard RBAC & unified login portal', 'Next.js 14 App Router + Tailwind setup', 'PostgreSQL seed data & state schemas'],
            },
            {
              sprint: 'Sprint 2 (Weeks 3-4)',
              goal: 'Dynamic Slot Engine & Booking',
              items: ['Pure TypeScript slot algorithm (scheduling.ts)', '30-min window evaluation & 15-min buffers', '3-Step booking wizard with 20% deposit', 'Concurrency locking badge (FR-03)'],
            },
            {
              sprint: 'Sprint 3 (Weeks 5-6)',
              goal: 'Finite State Machine & Mobile',
              items: ['Strict linear FSM engine (state-machine.ts)', '6-Column Operations Dispatch Kanban', 'Skill-based staff assignment & Dhaka zones', '390px Mobile portal + Signature pad'],
            },
            {
              sprint: 'Sprint 4 (Weeks 7-8)',
              goal: 'CRM Webhooks & Analytics',
              items: ['Automated CRM SMS/WhatsApp alert stream', 'Autonomous tax invoicing modal (INV-...)', 'Revenue & Technician Productivity metrics', 'Production build verification (npm run build)'],
            },
          ].map((s, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">{s.sprint}</span>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.goal}</h4>
              <ul className="space-y-1 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                {s.items.map((it, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-1">
                    <span className="text-emerald-500">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 7: Dynamic Slot Engine
    {
      id: 7,
      category: 'Core Feature 1',
      title: 'Dynamic Slot Engine & Concurrency Locking',
      subtitle: 'Zero double-booking guarantee via algorithmic window evaluation',
      speakerNotes: 'The slot engine evaluates operating hours and service duration with a 15-minute buffer. Transactional locks prevent double bookings, and the 20% deposit secures customer commitment.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" /> Dynamic Slot Engine (FR-02)
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>• Operates over working hours: <strong>8:00 AM – 6:00 PM</strong></li>
              <li>• Generates 30-minute start time candidates</li>
              <li>• Evaluates requested service duration (45 to 180 mins)</li>
              <li>• Appends mandatory <strong>15-minute travel & prep buffer</strong></li>
              <li>• Filters past slots dynamically for same-day bookings</li>
              <li>• Evaluates active technician capacity in real time</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" /> Concurrency Lock & Deposit (FR-03, FR-06)
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>• Overlap condition: <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">start &lt; bEnd && end &gt; bStart</code></li>
              <li>• Concurrency lock badge eliminates double-booking collisions</li>
              <li>• <strong>20% Upfront Deposit Gateway</strong> (bKash / Nagad / Card)</li>
              <li>• Eliminates customer no-shows through financial commitment</li>
              <li>• Automatically initiates booking in clean <em>Pending</em> state</li>
            </ul>
          </div>
        </div>
      ),
    },

    // SLIDE 8: Finite State Machine
    {
      id: 8,
      category: 'Core Feature 2',
      title: 'Deterministic Finite State Machine Lifecycle',
      subtitle: 'Strict linear progression with role-based transition security',
      speakerNotes: 'Our state engine enforces strict linear progression: Pending, Scheduled, En Route, In Progress, Completed, Billed. Illegal state jumps are strictly rejected by the validator.',
      content: (
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { num: '1', name: 'Pending', role: 'Customer', desc: 'Deposit locked' },
              { num: '2', name: 'Scheduled', role: 'Dispatcher', desc: 'Staff assigned' },
              { num: '3', name: 'En Route', role: 'Technician', desc: 'Travel & ETA SMS' },
              { num: '4', name: 'In Progress', role: 'Technician', desc: 'Work timer active' },
              { num: '5', name: 'Completed', role: 'Technician', desc: 'Client signature' },
              { num: '6', name: 'Billed', role: 'System Engine', desc: 'Invoice settled' },
            ].map((st) => (
              <div key={st.num} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs space-y-1">
                <span className="text-[10px] font-black text-emerald-600 font-mono">STEP {st.num}</span>
                <h5 className="text-xs font-bold text-slate-900">{st.name}</h5>
                <span className="inline-block text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  {st.role}
                </span>
                <p className="text-[10px] text-slate-500">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 text-center font-mono">
            validateTransition(current, next) ➔ Strict Rejection of Illegal Jumps (e.g. Pending ➔ Completed)
          </div>
        </div>
      ),
    },

    // SLIDE 9: Dispatch & Mobile
    {
      id: 9,
      category: 'Core Feature 3',
      title: 'Skill-Based Dispatch & Technician Mobile View',
      subtitle: 'Operational clarity for managers and field execution for technicians',
      speakerNotes: 'Dispatchers assign technicians matching service skills and location zones. Technicians execute jobs on their mobile portal with task switching, on-site timer, and client signature sign-off.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900">Skill-Based Dispatching (UC-05)</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• 6-Column Kanban Board representing the FSM pipeline</li>
              <li>• Technician skill taxonomy (Paint Buffing, Steam Wash, Diagnostics)</li>
              <li>• Automatic <strong>✓ Skill Match</strong> badge in assignment modal</li>
              <li>• Geographical zone proximity routing (Gulshan, Banani, Dhanmondi)</li>
              <li>• Real-time technician active workload indicator</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900">Field Technician Mobile View (NFR-04)</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• 390px mobile viewport frame with minimal wireframe styling</li>
              <li>• Top Numbered Task Switcher Bar (Task 1, Task 2, Task 3)</li>
              <li>• 1-Tap Sequential Actions: <em>Accept Trip</em> ➔ <em>Start Timer</em></li>
              <li>• Live on-site work duration stopwatch</li>
              <li>• HTML5 signature canvas for digital client sign-off</li>
            </ul>
          </div>
        </div>
      ),
    },

    // SLIDE 10: CRM & Analytics
    {
      id: 10,
      category: 'Core Feature 4',
      title: 'Automated CRM Alerts, Tax Invoices & Analytics',
      subtitle: 'Real-time customer updates, instant invoicing, and productivity metrics',
      speakerNotes: 'The CRM webhook engine sends live SMS updates. Upon signature capture, tax invoices are auto-generated and operational analytics track gross pipeline revenue and technician utilization.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-600" /> Automated CRM Alerts (FR-05)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Event-driven SMS/WhatsApp alert dispatch to customer phone</li>
              <li>• <strong>Alert 1:</strong> Deposit Confirmed (Awaiting Dispatcher)</li>
              <li>• <strong>Alert 2:</strong> Staff Scheduled (Technician Assigned)</li>
              <li>• <strong>Alert 3:</strong> En Route ETA Update (~20 mins)</li>
              <li>• <strong>Alert 4:</strong> Completed & Official Tax Invoice Ready</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> Invoicing & Analytics (FR-07, FR-08)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Autonomous billing settlement upon signature capture</li>
              <li>• Itemized Printable Tax Invoice Modal (<code className="font-mono">INV-...</code>)</li>
              <li>• Real-Time Revenue Pipeline in BDT (৳)</li>
              <li>• Technician Productivity Breakdown (Utilization %, Active vs Done)</li>
              <li>• Customer Feedback CSAT Rating (<strong>4.9 / 5.0 ★ • 98% CSAT</strong>)</li>
            </ul>
          </div>
        </div>
      ),
    },

    // SLIDE 11: Live Demo Walkthrough
    {
      id: 11,
      category: 'System Demonstration',
      title: 'Live Demonstration Walkthrough (5-Step Lifecycle)',
      subtitle: 'Complete end-to-end journey from clean 0-job state to settled tax invoice',
      speakerNotes: 'Now we will switch to our live browser window at localhost:3000 to demonstrate the full 5-step lifecycle.',
      content: (
        <div className="space-y-2.5 max-w-4xl mx-auto">
          {[
            { step: '1', title: 'Clean Pipeline Start', desc: 'Open /admin/dispatch to verify clean 0-job state ready for demo.' },
            { step: '2', title: 'Customer Booking (/book)', desc: 'Select service, pick dynamic slot, pay 20% deposit via bKash/Nagad.' },
            { step: '3', title: 'Dispatcher Assignment (/admin/dispatch)', desc: 'Assign technician matching skill taxonomy & zone. Moves to Scheduled.' },
            { step: '4', title: 'Mobile Execution (/tech/active-job)', desc: 'Accept job, start trip (En Route), run work timer (In Progress), collect digital signature.' },
            { step: '5', title: 'Automated Invoicing & Analytics (/admin/analytics)', desc: 'Auto-settles to Billed, generates printable invoice, and updates revenue.' },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 text-left shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-emerald-400 font-mono font-bold text-xs shrink-0">
                {item.step}
              </span>
              <div>
                <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 12: Tech Stack
    {
      id: 12,
      category: 'Technology Stack',
      title: 'Technology Stack & Verification Metrics',
      subtitle: 'Production-ready Next.js 14 full-stack architecture',
      speakerNotes: 'Our platform is built with Next.js 14, TypeScript, and TailwindCSS. The production build passed with zero errors across all 12 routes.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {[
            {
              title: 'Frontend',
              items: ['Next.js 14 (App Router)', 'React 18 & TypeScript', 'TailwindCSS & Lucide Icons', 'Responsive 390px Mobile View'],
            },
            {
              title: 'Backend & Logic',
              items: ['PostgreSQL Schema DDL', 'Finite State Machine Engine', 'Dynamic Slot Algorithm', 'Webhook REST Endpoints'],
            },
            {
              title: 'State & Store',
              items: ['Reactive Context Store', 'LocalStorage Persistence', 'Zero 3rd-Party Dependencies', '100% Offline / Vercel Ready'],
            },
            {
              title: 'Verification',
              items: ['npm run build: 12/12 routes', '0 Build & 0 Type Errors', '100% SRS-2 Compliance', 'GitHub main branch synced'],
              highlight: true,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 text-left shadow-xs space-y-2 ${
                card.highlight ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <h4 className="text-xs font-bold text-slate-900">{card.title}</h4>
              <ul className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                {card.items.map((it, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-1">
                    <span className="text-emerald-500">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },

    // SLIDE 13: Conclusion
    {
      id: 13,
      category: 'Summary & Conclusion',
      title: 'Thank You! Questions & Discussion',
      subtitle: 'Agentic Operations & Dynamic Scheduling Platform for Field Services',
      isDark: true,
      speakerNotes: 'In conclusion, our platform successfully achieves all goals set out in our SRS. Thank you, and we now welcome any questions from the honorable faculty.',
      content: (
        <div className="space-y-5 max-w-3xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 text-left space-y-3">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
              Key Project Takeaways
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>✔ <strong>100% Compliance</strong> with SRS-2 Scopes 1-4, Use Cases UC-01–09, and Requirements FR-01–08.</li>
              <li>✔ Successfully eliminates <strong>double-bookings, customer no-shows, and revenue leakage</strong>.</li>
              <li>✔ Developed iteratively following <strong>Agile Scrum across 4 two-week sprints</strong>.</li>
              <li>✔ Production verified and deployable on Vercel with zero database setup barriers.</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Home className="h-4 w-4" /> Open Platform Home
            </Link>
            <Link
              href="/admin/dispatch"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-700 shadow-sm"
            >
              <Layers className="h-4 w-4" /> Open Dispatch Kanban
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  return (
    <div className={`min-h-screen flex flex-col ${slide.isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <div className={`px-4 sm:px-8 py-3 flex items-center justify-between border-b ${slide.isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              slide.isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Platform</span>
          </Link>
          <span className={`text-xs ${slide.isDark ? 'text-slate-600' : 'text-slate-300'}`}>|</span>
          <span className="text-xs font-bold font-mono text-emerald-500">
            SLIDE {slide.id} OF {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showNotes 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' 
                : slide.isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle Speaker Script (Hotkey: N)"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Speaker Script</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              slide.isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Print / Save Slides as PDF"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-6xl mx-auto w-full">
        {/* Category Pill */}
        <div className="mb-3">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {slide.category}
          </span>
        </div>

        {/* Title */}
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight max-w-4xl leading-tight ${slide.isDark ? 'text-white' : 'text-slate-900'}`}>
          {slide.title}
        </h1>

        {/* Subtitle */}
        {slide.subtitle && (
          <p className={`text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed ${slide.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {slide.subtitle}
          </p>
        )}

        {/* Dynamic Slide Content Body */}
        <div className="mt-8 w-full">
          {slide.content}
        </div>
      </div>

      {/* Speaker Notes Overlay Drawer */}
      {showNotes && (
        <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 text-left text-white max-w-6xl mx-auto w-full rounded-t-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-400 font-mono flex items-center gap-1.5">
              🎙️ Speaker Script (What to say for Slide {slide.id})
            </span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans pt-1">
            "{slide.speakerNotes}"
          </p>
        </div>
      )}

      {/* Bottom Navigation Toolbar */}
      <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${slide.isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx 
                  ? 'w-6 bg-emerald-500' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Jump to Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Prev / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border disabled:opacity-30 ${
              slide.isDark ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <span className="text-xs font-mono font-bold px-2 text-slate-500">
            {currentSlide + 1} / {slides.length}
          </span>

          <button
            type="button"
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentSlide === slides.length - 1
                ? 'bg-slate-300 text-slate-500'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
