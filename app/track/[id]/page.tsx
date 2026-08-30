'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StateBadge } from '@/components/state-badge';
import { STATE_METADATA } from '@/lib/state-machine';
import { formatBDT } from '@/lib/types';
import { PayloadViewer, formatEventTitle } from '@/components/payload-viewer';
import { format, parseISO } from 'date-fns';
import { 
  CheckCircle2, 
  MapPin, 
  ArrowLeft, 
  Calendar, 
  FileText,
  Navigation,
  User
} from 'lucide-react';

export default function BookingTrackerPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  const { bookings, services, profiles, logs } = useApp();

  const booking = bookings.find((b) => b.id === bookingId);
  const service = services.find((s) => s.id === booking?.service_id);
  const technician = profiles.find((p) => p.id === booking?.technician_id);
  const bookingLogs = logs.filter((l) => l.booking_id === bookingId);

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
          <p className="text-xs text-slate-500">
            We could not find booking record #{bookingId}.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Create a New Booking
          </Link>
        </div>
      </div>
    );
  }

  const steps: Array<{ status: typeof booking.status; label: string; desc: string }> = [
    { status: 'pending', label: 'Pending', desc: 'Deposit confirmed; awaiting technician' },
    { status: 'scheduled', label: 'Scheduled', desc: 'Technician assigned to dispatch' },
    { status: 'en_route', label: 'En Route', desc: 'Technician traveling in Dhaka' },
    { status: 'in_progress', label: 'In Progress', desc: 'On-site work in progress' },
    { status: 'completed', label: 'Completed', desc: 'Finished & signed-off' },
    { status: 'billed', label: 'Billed', desc: 'Settled in full' },
  ];

  const stateOrder = ['pending', 'scheduled', 'en_route', 'in_progress', 'completed', 'billed'];
  const currentIdx = stateOrder.indexOf(booking.status);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/book"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Booking
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Booking ID:</span>
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {booking.id}
          </span>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                {service?.name || 'Field Service'}
              </h1>
              <StateBadge status={booking.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {STATE_METADATA[booking.status]?.description}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[11px] text-slate-400 font-medium">Scheduled Window</div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {format(parseISO(booking.scheduled_start), 'MMM d, yyyy • h:mm a')}
            </div>
          </div>
        </div>

        {/* State Progression Bar */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Live Service Lifecycle
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {steps.map((s, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div
                  key={s.status}
                  className={`flex flex-col justify-between rounded-lg p-2.5 border transition-all text-left ${
                    isCurrent
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase">
                      0{idx + 1}
                    </span>
                    {isPast && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold">{s.label}</div>
                    <p className={`text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Technician Card (Minimal Initial Badge, Zero Faces) */}
        {technician && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs border border-slate-700">
                {getInitials(technician.full_name)}
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Field Technician
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {technician.full_name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{technician.phone}</div>
              </div>
            </div>

            {booking.status === 'en_route' && (
              <div className="flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1 rounded text-xs font-bold border border-purple-200">
                <Navigation className="h-3.5 w-3.5" />
                <span>En Route in Dhaka • ETA ~20 mins</span>
              </div>
            )}
          </div>
        )}

        {/* Location & Summary Details in BDT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-500" /> Service Location
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {booking.service_address}
            </p>
            {booking.customer_notes && (
              <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                Note: {booking.customer_notes}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" /> Pricing & Deposit (BDT)
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">{formatBDT(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Deposit Paid (20%):</span>
                <span>{formatBDT(booking.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Remaining Due:</span>
                <span className="font-bold">
                  {formatBDT(booking.total_amount - booking.deposit_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signature on completion */}
        {booking.customer_signature_url && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-1.5">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Digital Sign-Off Verified
            </div>
            <div className="rounded border border-slate-200 bg-white p-2 w-fit">
              <img
                src={booking.customer_signature_url}
                alt="Client Signature"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Collected on-site by field technician.
            </p>
          </div>
        )}
      </div>

      {/* Audit Event Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Booking Audit Event Trail
        </h3>
        <div className="space-y-2">
          {bookingLogs.length === 0 ? (
            <p className="text-xs text-slate-400">No events logged yet.</p>
          ) : (
            bookingLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2.5 text-xs border-l-2 border-slate-300 pl-3 py-1.5"
              >
                <div className="shrink-0 text-slate-400 font-mono text-[10px] mt-0.5">
                  {format(parseISO(log.created_at), 'h:mm a')}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-xs">
                    {formatEventTitle(log.payload?.event, log.new_status)}
                  </span>
                  <PayloadViewer payload={log.payload} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
