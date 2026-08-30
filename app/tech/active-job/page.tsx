'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { StateBadge } from '@/components/state-badge';
import { SignaturePad } from '@/components/signature-pad';
import { RoleGuard } from '@/components/role-guard';
import { Booking, formatBDT } from '@/lib/types';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Play, 
  PenTool, 
  Smartphone, 
  Check, 
  User,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TechnicianMobilePortal() {
  const { bookings, services, profiles, currentProfile, updateBookingStatus, switchRole } = useApp();

  // Active Technician Selection (matches current logged in technician or defaults to Kazi Shakil)
  const [activeTechId, setActiveTechId] = useState<string>(currentProfile.id);

  // Keep activeTechId in sync when currentProfile changes
  useEffect(() => {
    if (currentProfile.role === 'technician') {
      setActiveTechId(currentProfile.id);
    }
  }, [currentProfile]);

  // Selected Booking ID state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Signature Modal State
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);

  // Live On-Site Work Timer
  const [workTimerSeconds, setWorkTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Phone Frame Toggle
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  const technicians = profiles.filter((p) => p.role === 'technician');
  const activeTech = profiles.find((p) => p.id === activeTechId) || currentProfile;

  // Get technician's assigned tasks (scheduled, en_route, in_progress)
  const assignedTasks = bookings.filter(
    (b) => b.technician_id === activeTechId && ['scheduled', 'en_route', 'in_progress'].includes(b.status)
  );

  const completedTasks = bookings.filter(
    (b) => b.technician_id === activeTechId && ['completed', 'billed'].includes(b.status)
  );

  // Set default active job
  const activeJob: Booking | undefined = 
    assignedTasks.find((b) => b.id === selectedBookingId) ||
    assignedTasks.find((b) => b.status === 'in_progress') ||
    assignedTasks.find((b) => b.status === 'en_route') ||
    assignedTasks[0] ||
    completedTasks[0];

  const service = services.find((s) => s.id === activeJob?.service_id);
  const customer = profiles.find((p) => p.id === activeJob?.customer_id);

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Work Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJob?.status === 'in_progress') {
      setIsTimerRunning(true);
      interval = setInterval(() => {
        setWorkTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [activeJob?.status, activeJob?.id]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // State Transition Actions
  const handleAcceptAndStartTrip = async () => {
    if (!activeJob) return;
    await updateBookingStatus(activeJob.id, 'en_route', {
      customPayload: {
        eta_minutes: 20,
        sms_sent: true,
        technician_accepted: true,
      },
    });
  };

  const handleArrivedAndStart = async () => {
    if (!activeJob) return;
    await updateBookingStatus(activeJob.id, 'in_progress', {
      customPayload: {
        work_timer_started: true,
      },
    });
  };

  const handleSignatureSave = async (signatureDataUrl: string) => {
    if (!activeJob) return;
    setIsSubmittingSignature(true);

    try {
      await updateBookingStatus(activeJob.id, 'completed', {
        signatureUrl: signatureDataUrl,
        customPayload: {
          timer_duration_minutes: Math.ceil(workTimerSeconds / 60) || service?.duration_minutes || 45,
          signed_by: customer?.full_name || 'Client',
        },
      });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      setIsSignatureModalOpen(false);
      setWorkTimerSeconds(0);
    } finally {
      setIsSubmittingSignature(false);
    }
  };

  const openGoogleMaps = () => {
    if (!activeJob) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      activeJob.service_address
    )}`;
    window.open(url, '_blank');
  };

  return (
    <RoleGuard allowedRoles={['technician']} portalName="Field Technician Mobile Portal">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
        {/* Top Header & Simulation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Field Technician Mobile View (390px)
              </h1>
              <p className="text-xs text-slate-500">
                Assigned Task Queue • On-Site Work Timer • HTML5 Signature Capture
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Switch Active Tech */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Active Tech:</span>
              <select
                value={activeTechId}
                onChange={(e) => {
                  setActiveTechId(e.target.value);
                  switchRole('technician', e.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 focus:border-slate-900 focus:outline-none"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              {isPhoneFrame ? 'Expand View' : '390px Frame'}
            </button>
          </div>
        </div>

        {/* Main Content Area: Phone Container Frame */}
        <div className="flex justify-center">
          <div
            className={`w-full transition-all ${
              isPhoneFrame
                ? 'max-w-[400px] rounded-3xl border-4 border-slate-900 bg-slate-900 p-1.5 shadow-xl'
                : 'max-w-xl'
            }`}
          >
            <div className="rounded-2xl bg-slate-50 overflow-hidden min-h-[640px] flex flex-col">
              {/* Mobile Top App Bar */}
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                    {getInitials(activeTech?.full_name)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{activeTech?.full_name}</div>
                    <div className="text-[10px] text-emerald-400">
                      {assignedTasks.length} Assigned Task{assignedTasks.length !== 1 ? 's' : ''} Today
                    </div>
                  </div>
                </div>

                {activeJob && (
                  <StateBadge status={activeJob.status} size="sm" />
                )}
              </div>

              {/* Top Numbered Assigned Tasks Bar */}
              {assignedTasks.length > 0 && (
                <div className="bg-white border-b border-slate-200 p-2 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    {assignedTasks.map((task, idx) => {
                      const isSelected = (activeJob?.id === task.id);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setSelectedBookingId(task.id)}
                          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                            isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>Task #{task.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[9px] px-1 rounded uppercase ${
                            task.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-300' :
                            task.status === 'en_route' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'
                          }`}>
                            {task.status === 'in_progress' ? 'Active' : task.status === 'en_route' ? 'Trip' : 'New'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* In-field Body */}
              <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
                {!activeJob ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-center space-y-2 mt-8">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-900">All Done For Today!</h3>
                    <p className="text-[11px] text-slate-500">
                      No pending or active jobs assigned to {activeTech?.full_name}.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active Job Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                              Job #{activeJob.id.slice(-6).toUpperCase()}
                            </span>
                            {activeJob.status === 'scheduled' && (
                              <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                                Awaiting Acceptance
                              </span>
                            )}
                          </div>
                          <h2 className="text-xs font-bold text-slate-900 mt-0.5">
                            {service?.name || 'On-Demand Service'}
                          </h2>
                        </div>
                        <span className="text-xs font-black text-slate-900">
                          {formatBDT(activeJob.total_amount)}
                        </span>
                      </div>

                      {/* Client & Navigation Info */}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            <span>{customer?.full_name || 'Client'}</span>
                          </div>
                          {customer?.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono"
                            >
                              <Phone className="h-3 w-3" /> Call
                            </a>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1 border-t border-slate-200">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{activeJob.service_address}</span>
                        </div>

                        {activeJob.customer_notes && (
                          <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                            <span className="font-semibold text-slate-700">Note: </span>
                            {activeJob.customer_notes}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={openGoogleMaps}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <Navigation className="h-3.5 w-3.5 text-blue-600" />
                          Open Navigation Maps (Dhaka)
                        </button>
                      </div>

                      {/* Service Checklist */}
                      {service?.features && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Required Service Scope
                          </div>
                          <div className="space-y-1">
                            {service.features.map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Live Work Timer */}
                      {activeJob.status === 'in_progress' && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Live On-Site Work Timer
                          </div>
                          <div className="text-xl font-black font-mono text-emerald-950">
                            {formatTimer(workTimerSeconds)}
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            Target duration: {service?.duration_minutes} mins
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Contextual Single Action Bottom Bar */}
              {activeJob && (
                <div className="border-t border-slate-200 bg-white p-3.5 shadow-sm shrink-0">
                  {/* 1. If Scheduled: Accept & Start Trip */}
                  {activeJob.status === 'scheduled' && (
                    <button
                      type="button"
                      onClick={handleAcceptAndStartTrip}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-xs sm:text-sm shadow-sm transition-colors active:scale-98"
                    >
                      <Navigation className="h-4 w-4" />
                      Accept Assignment & Start Trip (En Route)
                    </button>
                  )}

                  {/* 2. If En Route: Arrived & Start Work */}
                  {activeJob.status === 'en_route' && (
                    <button
                      type="button"
                      onClick={handleArrivedAndStart}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-xs sm:text-sm shadow-sm transition-colors active:scale-98"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      Arrived On-Site & Start Work Timer
                    </button>
                  )}

                  {/* 3. If In Progress: Complete & Collect Signature */}
                  {activeJob.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs sm:text-sm shadow-sm transition-colors active:scale-98"
                    >
                      <PenTool className="h-4 w-4" />
                      Complete Job & Collect Signature
                    </button>
                  )}

                  {/* 4. If Completed or Billed */}
                  {['completed', 'billed'].includes(activeJob.status) && (
                    <div className="text-center py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                      ✓ Job Signed Off & Settled in Full
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Digital Signature Modal */}
        {isSignatureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Sign-Off (Dhaka)
                </h3>
                <p className="text-xs text-slate-500">
                  Client digital sign-off to authorize final invoice settlement.
                </p>
              </div>

              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={() => setIsSignatureModalOpen(false)}
                isSubmitting={isSubmittingSignature}
              />
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
