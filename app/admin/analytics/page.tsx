'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Booking, SystemEventLog, formatBDT } from '@/lib/types';
import { StateBadge } from '@/components/state-badge';
import { InvoiceModal } from '@/components/invoice-modal';
import { PayloadViewer, formatEventTitle } from '@/components/payload-viewer';
import { RoleGuard } from '@/components/role-guard';
import { format, parseISO } from 'date-fns';
import { 
  DollarSign, 
  CalendarCheck, 
  Users, 
  TrendingUp, 
  FileText, 
  Activity, 
  Search, 
  Radio, 
  Send
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const { bookings, services, profiles, logs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);
  const [activeLogFilter, setActiveLogFilter] = useState<'all' | 'transitions' | 'webhooks'>('all');

  // KPI Calculations in BDT
  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  }, [bookings]);

  const settledRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'billed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  }, [bookings]);

  const totalBookingsCount = bookings.length;
  const avgTicketValue = totalBookingsCount > 0 ? totalRevenue / totalBookingsCount : 0;

  // Utilization calculation
  const technicians = profiles.filter((p) => p.role === 'technician');
  const busyTechnicians = technicians.filter((t) =>
    bookings.some(
      (b) => b.technician_id === t.id && ['scheduled', 'en_route', 'in_progress'].includes(b.status)
    )
  );
  const utilizationRate =
    technicians.length > 0 ? Math.round((busyTechnicians.length / technicians.length) * 100) : 0;

  // Filtered Transactions
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const customer = profiles.find((p) => p.id === b.customer_id);
      const svc = services.find((s) => s.id === b.service_id);
      return (
        customer?.full_name.toLowerCase().includes(q) ||
        svc?.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.service_address.toLowerCase().includes(q)
      );
    });
  }, [bookings, searchQuery, profiles, services]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (activeLogFilter === 'transitions') {
        return log.new_status !== log.previous_status;
      }
      if (activeLogFilter === 'webhooks') {
        return log.payload?.sms_sent || log.payload?.client_notified_via || log.payload?.channel;
      }
      return true;
    });
  }, [logs, activeLogFilter]);

  return (
    <RoleGuard allowedRoles={['admin']} portalName="Operations Analytics & Webhook Stream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Revenue Metrics & Operations Analytics (BDT)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time pipeline metrics • Customer tax invoices • Live webhook audit feed
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              Live Webhook Stream Active
            </span>
          </div>
        </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Pipeline (MRR)</span>
            <div className="h-7 w-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold text-xs">
              ৳
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatBDT(totalRevenue)}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{formatBDT(settledRevenue)} settled in bank</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Operations Jobs</span>
            <div className="h-7 w-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <CalendarCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalBookingsCount} Bookings</div>
            <div className="text-[11px] text-slate-500 mt-1">Across all finite states</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tech Utilization Rate</span>
            <div className="h-7 w-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{utilizationRate}%</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {busyTechnicians.length} of {technicians.length} technicians assigned
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Ticket Value</span>
            <div className="h-7 w-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatBDT(avgTicketValue)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Per scheduled service</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Transactions & Live Webhook Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Transactions & Invoices</h2>
              <p className="text-xs text-slate-500">
                Inspect job settlements, 20% deposits, and printable customer tax invoices in BDT.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none w-48 sm:w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Client & Service</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total / Dep</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                      No matching transaction records found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const customer = profiles.find((p) => p.id === b.customer_id);
                    const svc = services.find((s) => s.id === b.service_id);

                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700 text-[11px]">
                          #{b.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{customer?.full_name || 'Client'}</div>
                          <div className="text-[11px] text-slate-500">{svc?.name}</div>
                        </td>
                        <td className="p-3">
                          <StateBadge status={b.status} size="sm" />
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-bold text-slate-900">{formatBDT(b.total_amount)}</div>
                          <div className="text-[10px] text-emerald-600">
                            Dep: {formatBDT(b.deposit_amount)}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForInvoice(b)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Event Webhook Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Live Webhook Feed
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Finite state audit logs & notification triggers
            </p>

            <div className="flex items-center gap-1.5 pt-2.5">
              {(['all', 'transitions', 'webhooks'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveLogFilter(filter)}
                  className={`text-[10px] font-bold px-2 py-1 rounded capitalize transition-colors ${
                    activeLogFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const triggeredByProfile = profiles.find((p) => p.id === log.triggered_by);
              return (
                <div
                  key={log.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Send className="h-3.5 w-3.5 text-slate-500" />
                      {formatEventTitle(log.payload?.event, log.new_status)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {format(parseISO(log.created_at), 'HH:mm:ss')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="text-slate-400">Job:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      #{log.booking_id.slice(-6).toUpperCase()}
                    </span>
                    {log.previous_status && (
                      <span className="text-slate-500 font-medium">
                        ({log.previous_status} ➔ {log.new_status})
                      </span>
                    )}
                  </div>

                  {triggeredByProfile && (
                    <div className="text-[11px] text-slate-500">
                      Actor: <span className="font-medium text-slate-700">{triggeredByProfile.full_name}</span> ({triggeredByProfile.role})
                    </div>
                  )}

                  {/* Clean human-readable metadata chips with ZERO code blocks */}
                  <PayloadViewer payload={log.payload} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invoice Modal Popup */}
      {selectedBookingForInvoice && (
        <InvoiceModal
          booking={selectedBookingForInvoice}
          service={services.find((s) => s.id === selectedBookingForInvoice.service_id)}
          customer={profiles.find((p) => p.id === selectedBookingForInvoice.customer_id)}
          technician={profiles.find((p) => p.id === selectedBookingForInvoice.technician_id)}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}
      </div>
    </RoleGuard>
  );
}
