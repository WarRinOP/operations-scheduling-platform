import React from 'react';

interface PayloadViewerProps {
  payload?: Record<string, any>;
}

const HUMAN_EVENT_NAMES: Record<string, string> = {
  booking_created: 'Booking Created',
  transition_to_pending: 'Created & Deposit Locked',
  transition_to_scheduled: 'Technician Assigned & Scheduled',
  transition_to_en_route: 'Technician En Route (Dhaka)',
  transition_to_in_progress: 'Arrived On-Site & Timer Started',
  transition_to_completed: 'Service Completed & Signed',
  transition_to_billed: 'Invoice Settled in Full',
  staff_assigned: 'Staff Assigned',
  trip_started: 'Trip Started',
  on_site_arrival: 'On-Site Arrival',
  signature_captured: 'Digital Signature Captured',
  automated_invoice_settlement: 'Automated Payment Settlement',
};

const HUMAN_KEY_LABELS: Record<string, string> = {
  actor_name: 'Actor',
  actor_role: 'Role',
  assigned_staff: 'Staff',
  assigned_by: 'Dispatcher',
  technician_name: 'Technician',
  technician: 'Technician',
  deposit_received: 'Deposit',
  deposit_paid: 'Deposit',
  total: 'Total',
  service: 'Service',
  channel: 'Channel',
  eta_minutes: 'ETA',
  eta: 'ETA',
  slot_locked: 'Slot',
  client_sign_off: 'Sign-off',
  final_amount_due: 'Due',
  timer_duration_minutes: 'Duration',
  signed_by: 'Signee',
  status: 'Status',
};

export function formatEventTitle(rawEvent?: string, newStatus?: string): string {
  if (rawEvent && HUMAN_EVENT_NAMES[rawEvent]) {
    return HUMAN_EVENT_NAMES[rawEvent];
  }
  if (rawEvent) {
    return rawEvent.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return newStatus ? `Status Updated to ${newStatus.toUpperCase()}` : 'System Event';
}

export const PayloadViewer: React.FC<PayloadViewerProps> = ({ payload }) => {
  if (!payload || Object.keys(payload).length === 0) return null;

  // Filter out the raw 'event' key since it's displayed in the title
  const entries = Object.entries(payload).filter(([k, v]) => {
    if (k === 'event' || k === 'service_id') return false;
    if (typeof v === 'boolean') return false; // skip internal flags
    return v !== null && v !== undefined && v !== '';
  });

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {entries.map(([key, value]) => {
        const label = HUMAN_KEY_LABELS[key] || key.replace(/_/g, ' ');
        const displayVal =
          key === 'eta_minutes' ? `${value} mins` :
          key === 'timer_duration_minutes' ? `${value} mins` :
          String(value);

        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-700 border border-slate-200/80 shadow-2xs"
          >
            <span className="text-slate-400 capitalize">{label}:</span>
            <span className="text-slate-800 font-semibold">{displayVal}</span>
          </span>
        );
      })}
    </div>
  );
};
