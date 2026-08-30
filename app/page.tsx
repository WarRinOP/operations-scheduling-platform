'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StateBadge } from '@/components/state-badge';
import { STATE_METADATA } from '@/lib/state-machine';
import { formatBDT } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { 
  CalendarDays, 
  LayoutDashboard, 
  Smartphone, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Zap, 
  CheckCircle2,
  FileCheck2,
  Lock,
  LogIn,
  MapPin,
  User,
  FileText,
  Check,
  Activity,
  Navigation,
  Play,
  PenTool,
  Phone
} from 'lucide-react';

export default function HomePage() {
  const { bookings, services, profiles, currentProfile, switchRole, updateBookingStatus } = useApp();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // ==========================================
  // 1. CUSTOMER OVERVIEW VIEW
  // ==========================================
  if (currentProfile.role === 'customer') {
    const myBookings = bookings.filter((b) => b.customer_id === currentProfile.id);
    const activeBooking = myBookings.find((b) => 
      ['pending', 'scheduled', 'en_route', 'in_progress'].includes(b.status)
    );

    const activeService = activeBooking ? services.find((s) => s.id === activeBooking.service_id) : null;
    const activeTech = activeBooking ? profiles.find((p) => p.id === activeBooking.technician_id) : null;

    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Customer Header Banner */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900 px-6 py-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-800 bg-blue-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
              <User className="h-3 w-3" /> Customer Service Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome back, {currentProfile.full_name}
            </h1>
            <p className="text-xs text-slate-300">
              Track your current service requests and view past job receipts.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <CalendarDays className="h-4 w-4 text-slate-900" />
              Book New Service
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Current Active Service Status & Condition */}
        {activeBooking ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Active Job #{activeBooking.id.slice(-6).toUpperCase()}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeService?.name || 'On-Demand Service'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StateBadge status={activeBooking.status} size="lg" />
                <Link
                  href={`/track/${activeBooking.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Activity className="h-3.5 w-3.5" />
                  Live Tracker
                </Link>
              </div>
            </div>

            {/* Linear State Progress Indicator */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Current Service Condition:</span>
                <span className="text-slate-500 font-normal capitalize">
                  {STATE_METADATA[activeBooking.status]?.label || activeBooking.status}
                </span>
              </div>

              {/* 5-Step Visual Progress Bar */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { key: 'pending', label: '1. Deposit' },
                  { key: 'scheduled', label: '2. Assigned' },
                  { key: 'en_route', label: '3. En Route' },
                  { key: 'in_progress', label: '4. Working' },
                  { key: 'completed', label: '5. Done' },
                ].map((st) => {
                  const stateOrder = ['pending', 'scheduled', 'en_route', 'in_progress', 'completed', 'billed'];
                  const currentIndex = stateOrder.indexOf(activeBooking.status);
                  const stepIndex = stateOrder.indexOf(st.key);
                  const isDone = currentIndex >= stepIndex;
                  const isCurrent = activeBooking.status === st.key;

                  return (
                    <div
                      key={st.key}
                      className={`rounded-lg p-2 text-center border transition-all ${
                        isCurrent
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <div className="text-[10px] sm:text-xs truncate">{st.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Details & Assigned Technician */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Time</span>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {format(parseISO(activeBooking.scheduled_start), 'PPP • h:mm a')}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Location</span>
                <div className="text-xs font-semibold text-slate-800 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{activeBooking.service_address}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Technician</span>
                {activeTech ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">
                      {getInitials(activeTech.full_name)}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{activeTech.full_name}</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Dispatching soon...
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-200">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Active Service In-Flight</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no active or scheduled service appointments. Book a new technician appointment in 3 easy steps.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Book Service Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Customer Service Booking Records / History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">My Service Records & Receipts</h2>
              <p className="text-xs text-slate-500">History of all doorstep services requested on your account</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              {myBookings.length} Total Bookings
            </span>
          </div>

          {myBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No previous bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Scheduled Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Total (BDT)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBookings.map((b) => {
                    const svc = services.find((s) => s.id === b.service_id);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">
                          #{b.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {svc?.name || 'Field Service'}
                        </td>
                        <td className="p-3 text-slate-500">
                          {format(parseISO(b.scheduled_start), 'dd MMM yyyy, h:mm a')}
                        </td>
                        <td className="p-3">
                          <StateBadge status={b.status} size="sm" />
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatBDT(b.total_amount)}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/track/${b.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors"
                          >
                            Track / Receipt
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. TECHNICIAN OVERVIEW VIEW (REACTIVE ASSIGNED QUEUE)
  // ==========================================
  if (currentProfile.role === 'technician') {
    const myAllJobs = bookings.filter((b) => b.technician_id === currentProfile.id);
    const assignedTasks = myAllJobs.filter((b) => 
      ['scheduled', 'en_route', 'in_progress'].includes(b.status)
    );
    const completedJobs = myAllJobs.filter((b) => 
      ['completed', 'billed'].includes(b.status)
    );

    const handleAcceptJob = async (jobId: string) => {
      await updateBookingStatus(jobId, 'en_route', {
        customPayload: {
          eta_minutes: 20,
          sms_sent: true,
          technician_accepted: true,
        },
      });
    };

    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Technician Header Banner */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900 px-6 py-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              <Smartphone className="h-3 w-3" /> Field Technician Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Technician: {currentProfile.full_name}
            </h1>
            <p className="text-xs text-slate-300">
              {assignedTasks.length} assigned task{assignedTasks.length !== 1 ? 's' : ''} in queue • Accept tasks and perform on-site sign-offs.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/tech/active-job"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Smartphone className="h-4 w-4 text-slate-900" />
              Open Mobile Active Job (390px)
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Assigned Tasks Queue (Numbered on Top) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Assigned Tasks Queue
                <span className="bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  {assignedTasks.length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-500">Numbered task queue assigned to you by operations dispatchers</p>
            </div>
          </div>

          {assignedTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">No Pending Tasks in Queue</h3>
              <p className="text-xs text-slate-500">
                You are currently on standby. When a dispatcher assigns a job in Dhaka, it will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedTasks.map((task, idx) => {
                const svc = services.find((s) => s.id === task.service_id);
                const cust = profiles.find((p) => p.id === task.customer_id);

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-4.5 space-y-3 transition-all ${
                      task.status === 'in_progress'
                        ? 'border-emerald-400 bg-emerald-50/30 shadow-sm'
                        : task.status === 'en_route'
                        ? 'border-purple-300 bg-purple-50/20 shadow-sm'
                        : 'border-amber-200 bg-amber-50/20 shadow-sm'
                    }`}
                  >
                    {/* Task Header with Number */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
                            Task #{task.id.slice(-6).toUpperCase()}
                          </div>
                          <h3 className="text-xs font-bold text-slate-900">{svc?.name}</h3>
                        </div>
                      </div>
                      <StateBadge status={task.status} size="sm" />
                    </div>

                    {/* Client & Address Info */}
                    <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cust?.full_name || 'Client'}</span>
                        </div>
                        {cust?.phone && (
                          <a
                            href={`tel:${cust.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200"
                          >
                            <Phone className="h-3 w-3" /> {cust.phone}
                          </a>
                        )}
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{task.service_address}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{format(parseISO(task.scheduled_start), 'PPP • h:mm a')}</span>
                      </div>
                    </div>

                    {/* Task Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {task.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => handleAcceptJob(task.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white py-2 px-3 text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          Accept & Start Trip (En Route)
                        </button>
                      )}

                      {task.status === 'en_route' && (
                        <Link
                          href="/tech/active-job"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs font-bold shadow-sm transition-all"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                          Arrive & Start Work Timer
                        </Link>
                      )}

                      {task.status === 'in_progress' && (
                        <Link
                          href="/tech/active-job"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 text-xs font-bold shadow-sm transition-all"
                        >
                          <PenTool className="h-3.5 w-3.5" />
                          Capture Customer Signature
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Jobs History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Completed Service Tasks</h2>
            <span className="text-xs font-bold text-slate-500">
              {completedJobs.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {completedJobs.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">No completed jobs on record yet.</p>
            ) : (
              completedJobs.map((b) => {
                const svc = services.find((s) => s.id === b.service_id);
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800">#{b.id.slice(-6).toUpperCase()}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="font-semibold text-slate-900">{svc?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StateBadge status={b.status} size="sm" />
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Signed & Verified
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. ADMIN / DISPATCHER OVERVIEW VIEW
  // ==========================================
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.total_amount || 0), 0);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeCount = bookings.filter((b) => ['scheduled', 'en_route', 'in_progress'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => ['completed', 'billed'].includes(b.status)).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / System Overview */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900 px-6 py-8 sm:px-8 sm:py-10 text-white shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Operations & Dynamic Scheduling Platform — Dhaka Operations
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-4xl text-white">
            Field Operations & Dynamic Scheduling Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Deterministic Finite State Machine • Dynamic Conflict-Free Slot Calculation • Field Technician Digital Signatures • Real-Time Operations Pipeline (BDT)
          </p>
          
          <div className="pt-3 flex flex-wrap gap-2.5">
            <Link
              href="/admin/dispatch"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-900" />
              Open Dispatch Kanban
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-purple-400" />
              Analytics & Tax Invoices (BDT)
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Bar (BDT Currency) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Dispatch</span>
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{pendingCount} Jobs</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending technician assignment</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active In-Field</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{activeCount} Jobs</div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled, En Route or In Progress</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed / Billed</span>
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{completedCount} Jobs</div>
          <p className="text-[11px] text-slate-500 mt-1">Signed-off & balance settled</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Revenue</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">BDT</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">৳{totalRevenue.toLocaleString('en-BD')}</div>
          <p className="text-[11px] text-slate-500 mt-1">Gross pipeline transaction value</p>
        </div>
      </div>

      {/* State Machine Flow (Minimal Wireframe Style) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Strict Finite State Machine Workflow</h2>
            <p className="text-xs text-slate-500">
              Guaranteed linear state progression. Illegal skips are strictly rejected.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md w-fit">
            <ShieldCheck className="h-3.5 w-3.5" /> State Guard Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-1">
          {[
            { step: '1', title: 'Pending', desc: 'Deposit received; awaiting staff assign', role: 'Customer' },
            { step: '2', title: 'Scheduled', desc: 'Technician assigned; slot locked', role: 'Dispatcher' },
            { step: '3', title: 'En Route', desc: 'Tech departed; arrival SMS sent', role: 'Technician' },
            { step: '4', title: 'In Progress', desc: 'Tech arrived; live work timer starts', role: 'Technician' },
            { step: '5', title: 'Completed', desc: 'Job done; client signature collected', role: 'Technician' },
            { step: '6', title: 'Billed', desc: 'Final invoice generated & settled', role: 'Automated Bot' },
          ].map((item) => (
            <div
              key={item.step}
              className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">
                  {item.step}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">{item.role}</span>
              </div>
              <div className="text-xs font-bold text-slate-800">{item.title}</div>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
