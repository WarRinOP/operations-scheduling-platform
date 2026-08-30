'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Booking, JobStatus, Profile, formatBDT } from '@/lib/types';
import { StateBadge } from '@/components/state-badge';
import { RoleGuard } from '@/components/role-guard';
import { STATE_METADATA, getNextSequentialState } from '@/lib/state-machine';
import { format, parseISO } from 'date-fns';
import { 
  UserPlus, 
  Search, 
  ArrowRight, 
  Check, 
  X,
  BarChart3,
  Clock,
  MapPin,
  User
} from 'lucide-react';

const KANBAN_COLUMNS: Array<{ status: JobStatus; title: string; color: string; border: string }> = [
  { status: 'pending', title: 'Pending Dispatch', color: 'bg-amber-500/10 text-amber-800', border: 'border-amber-200' },
  { status: 'scheduled', title: 'Scheduled', color: 'bg-blue-500/10 text-blue-800', border: 'border-blue-200' },
  { status: 'en_route', title: 'En Route', color: 'bg-purple-500/10 text-purple-800', border: 'border-purple-200' },
  { status: 'in_progress', title: 'In Progress', color: 'bg-emerald-500/10 text-emerald-800', border: 'border-emerald-200' },
  { status: 'completed', title: 'Completed', color: 'bg-teal-500/10 text-teal-800', border: 'border-teal-200' },
  { status: 'billed', title: 'Billed & Settled', color: 'bg-slate-500/10 text-slate-800', border: 'border-slate-300' },
];

export default function DispatchKanbanPage() {
  const { bookings, services, profiles, updateBookingStatus, assignTechnician } = useApp();

  // Filters
  const [techFilter, setTechFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Staff Assignment Modal
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const technicians = profiles.filter((p) => p.role === 'technician');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (techFilter === 'unassigned' && b.technician_id !== null) return false;
      if (techFilter !== 'all' && techFilter !== 'unassigned' && b.technician_id !== techFilter) return false;

      if (selectedDate) {
        try {
          const bookingDate = format(parseISO(b.scheduled_start), 'yyyy-MM-dd');
          if (bookingDate !== selectedDate) return false;
        } catch {}
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const customer = profiles.find((p) => p.id === b.customer_id);
        const svc = services.find((s) => s.id === b.service_id);
        const matchName = customer?.full_name.toLowerCase().includes(q);
        const matchAddress = b.service_address.toLowerCase().includes(q);
        const matchService = svc?.name.toLowerCase().includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchService && !matchId) return false;
      }

      return true;
    });
  }, [bookings, techFilter, selectedDate, searchQuery, profiles, services]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedTechId) return;

    setIsAssigning(true);
    await assignTechnician(assigningBooking.id, selectedTechId);
    setIsAssigning(false);
    setAssigningBooking(null);
    setSelectedTechId('');
  };

  const handleAdvanceState = async (booking: Booking) => {
    const next = getNextSequentialState(booking.status);
    if (!next) return;
    await updateBookingStatus(booking.id, next);
  };

  return (
    <RoleGuard allowedRoles={['admin']} portalName="Operations Dispatch Kanban">
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
        {/* Top Dispatch Controls & Filter Bar */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  Dhaka Operations Dispatch Kanban
                  <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    {filteredBookings.length} Active Jobs
                  </span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Finite state lifecycle pipeline • Real-time technician assignment
                </p>
              </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Dhaka address, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none w-44 sm:w-56"
                />
              </div>

              {/* Technician Filter */}
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Technicians</option>
                <option value="unassigned">Unassigned Only</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-xs text-slate-400 hover:text-slate-700 p-1"
                  title="Clear date filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <Link
                href="/admin/analytics"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Analytics (BDT)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6-Column Kanban Board */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <div className="grid grid-cols-6 gap-4 min-w-[1400px] h-full">
            {KANBAN_COLUMNS.map((col) => {
              const columnBookings = filteredBookings.filter((b) => b.status === col.status);
              const nextState = getNextSequentialState(col.status);

              return (
                <div
                  key={col.status}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-3 h-full shadow-inner overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {col.title}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${col.border} ${col.color}`}
                      >
                        {columnBookings.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Card Stream */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {columnBookings.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
                        No jobs in {col.title}
                      </div>
                    ) : (
                      columnBookings.map((b) => {
                        const svc = services.find((s) => s.id === b.service_id);
                        const customer = profiles.find((p) => p.id === b.customer_id);
                        const tech = profiles.find((p) => p.id === b.technician_id);

                        return (
                          <div
                            key={b.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                          >
                            {/* Card Top */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                                  #{b.id.slice(-6).toUpperCase()}
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                  {svc?.name || 'Field Service'}
                                </h4>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-slate-900">
                                  {formatBDT(b.total_amount)}
                                </div>
                                <div className="text-[10px] text-emerald-600 font-semibold">
                                  Dep: {formatBDT(b.deposit_amount)}
                                </div>
                              </div>
                            </div>

                            {/* Customer & Address */}
                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{customer?.full_name || 'Client'}</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{b.service_address}</span>
                              </div>
                            </div>

                            {/* Scheduled Time & Technician (Initials Badge, Zero Photos) */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1 text-slate-500 font-mono">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>{format(parseISO(b.scheduled_start), 'h:mm a')}</span>
                              </div>

                              {tech ? (
                                <div className="flex items-center gap-1 font-medium text-slate-800">
                                  <div className="h-4 w-4 rounded bg-slate-800 text-white text-[8px] flex items-center justify-center font-bold">
                                    {getInitials(tech.full_name)}
                                  </div>
                                  <span className="truncate max-w-[80px]">{tech.full_name}</span>
                                </div>
                              ) : (
                                <span className="text-amber-700 font-semibold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Unassigned
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                              {/* If Pending: Assign Staff Button */}
                              {b.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssigningBooking(b);
                                    setSelectedTechId(technicians[0]?.id || '');
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white py-1.5 px-2 text-xs font-bold shadow-sm transition-all active:scale-95"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Assign Staff
                                </button>
                              )}

                              {/* Sequential Advance CTA for active dispatchers */}
                              {b.status !== 'pending' && b.status !== 'billed' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceState(b)}
                                  className="w-full flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 py-1.5 px-2 text-[11px] font-bold transition-all active:scale-95 group"
                                >
                                  <span>Advance to {nextState}</span>
                                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              )}

                              {b.status === 'billed' && (
                                <div className="w-full flex items-center justify-center gap-1 text-emerald-700 bg-emerald-50 py-1 px-2 rounded text-[11px] font-bold border border-emerald-200">
                                  <Check className="h-3.5 w-3.5" /> Settled in Full
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Assignment Modal (Minimal Initial Badges) */}
        {assigningBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assign Field Technician (Dhaka)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Booking #{assigningBooking.id.slice(-6).toUpperCase()} • Transitions to Scheduled
                  </p>
                </div>
                <button
                  onClick={() => setAssigningBooking(null)}
                  className="rounded p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Field Technician
                  </label>
                  <div className="space-y-2">
                    {technicians.map((t) => {
                      const isSelected = selectedTechId === t.id;
                      const techActiveJobs = bookings.filter(
                        (b) => b.technician_id === t.id && ['scheduled', 'en_route', 'in_progress'].includes(b.status)
                      ).length;

                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTechId(t.id)}
                          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs border border-slate-700">
                              {getInitials(t.full_name)}
                            </div>
                            <div>
                              <div className="text-xs font-bold">{t.full_name}</div>
                              <div className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {t.phone}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {techActiveJobs} Active
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssigningBooking(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedTechId}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isAssigning ? 'Locking Schedule...' : 'Lock Technician & Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
