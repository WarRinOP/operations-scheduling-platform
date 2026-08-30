'use client';

import React from 'react';
import { Booking, Profile, Service, formatBDT } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  booking: Booking;
  service?: Service;
  customer?: Profile;
  technician?: Profile;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  booking,
  service,
  customer,
  technician,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${booking.id.slice(-6).toUpperCase()}`;
  const depositPaid = booking.deposit_amount;
  const totalAmount = booking.total_amount;
  const balancePaid = totalAmount - depositPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 print:border-none print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Official Tax Invoice (Bangladesh)
            </span>
            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 border border-emerald-200">
              PAID IN FULL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="space-y-6 text-slate-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                  OPS
                </div>
                <h2 className="text-base font-bold text-slate-900">OpsFlow Bangladesh Ltd.</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                On-Demand Field Operations & Doorstep Services
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                House 12, Road 4, Gulshan-1, Dhaka 1212 • support@opsflow.com.bd
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <div className="text-sm font-bold text-slate-900 font-mono">{invoiceNumber}</div>
              <div className="text-xs text-slate-500">
                Date: {format(parseISO(booking.created_at), 'MMMM d, yyyy')}
              </div>
              <div className="text-xs text-slate-500">Gateway: bKash / Nagad Verified</div>
            </div>
          </div>

          {/* Bill To & Service Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Billed To Customer
              </span>
              <div className="font-bold text-slate-900 mt-1">{customer?.full_name || 'Client'}</div>
              <div className="text-slate-600">{booking.service_address}</div>
              <div className="text-slate-500 font-mono">{customer?.phone}</div>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Service & Staff
              </span>
              <div className="font-bold text-slate-900 mt-1">{service?.name}</div>
              <div className="text-slate-600">
                Technician: {technician?.full_name || 'Assigned Staff'}
              </div>
              <div className="text-slate-500">
                Fulfilled on: {format(parseISO(booking.scheduled_start), 'MMM d, yyyy • h:mm a')}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Service Description</th>
                  <th className="p-3 text-center">Duration</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">
                    {service?.name}
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {service?.description}
                    </div>
                  </td>
                  <td className="p-3 text-center text-slate-600">
                    {service?.duration_minutes} mins
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {formatBDT(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown in BDT */}
          <div className="flex justify-end pt-1">
            <div className="w-64 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatBDT(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Upfront Deposit (20% Paid):</span>
                <span>-{formatBDT(depositPaid)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>On-Site Balance (Paid):</span>
                <span>-{formatBDT(balancePaid)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Outstanding Balance:</span>
                <span>৳0.00 BDT</span>
              </div>
            </div>
          </div>

          {/* Digital Sign-off Verification */}
          {booking.customer_signature_url && (
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-600">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Client Digital Sign-Off Verified
                </div>
                <div className="text-[11px] text-slate-400">
                  Captured on-site in Dhaka by field technician
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-1">
                <img
                  src={booking.customer_signature_url}
                  alt="Customer Signature"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
