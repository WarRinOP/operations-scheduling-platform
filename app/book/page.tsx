'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Service, TimeSlot, formatBDT } from '@/lib/types';
import { calculateAvailableSlots } from '@/lib/scheduling';
import { RoleGuard } from '@/components/role-guard';
import { format, addDays, isSameDay } from 'date-fns';
import { 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Lock,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookServicePage() {
  const router = useRouter();
  const { services, bookings, profiles, currentProfile, createBooking } = useApp();

  // Wizard Step: 1 = Service, 2 = Date & Slot, 3 = Address & Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected state
  const [selectedService, setSelectedService] = useState<Service>(services[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Payment Method: 'bkash' | 'nagad' | 'card'
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');

  // Customer & Location Details
  const [formData, setFormData] = useState({
    fullName: currentProfile.role === 'customer' ? currentProfile.full_name : 'Tanvir Ahmed',
    email: currentProfile.role === 'customer' ? currentProfile.email : 'tanvir.ahmed@gmail.com',
    phone: currentProfile.phone || '+880 1711-234567',
    serviceAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    customerNotes: 'Apartment basement parking. Guard will show slot B-2.',
    bkashNumber: '01711234567',
    bkashPin: '•••••',
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '888',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic slot calculation
  const availableSlots = useMemo(() => {
    if (!selectedService) return [];
    return calculateAvailableSlots({
      date: selectedDate,
      service: selectedService,
      existingBookings: bookings,
      technicians: profiles.filter((p) => p.role === 'technician'),
    });
  }, [selectedDate, selectedService, bookings, profiles]);

  // Pricing in BDT
  const totalPrice = selectedService?.price || 0;
  const depositPercent = selectedService?.deposit_percentage || 20;
  const depositAmount = (totalPrice * depositPercent) / 100;
  const remainingBalance = totalPrice - depositAmount;

  // Next 7 days
  const dateOptions = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        customer_id: currentProfile.role === 'customer' ? currentProfile.id : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        technician_id: selectedSlot.technician_id || null,
        service_id: selectedService.id,
        scheduled_start: selectedSlot.start,
        scheduled_end: selectedSlot.end,
        service_address: formData.serviceAddress,
        customer_notes: formData.customerNotes,
        deposit_amount: depositAmount,
        total_amount: totalPrice,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      router.push(`/track/${newBooking.id}`);
    } catch (error) {
      console.error('Failed to create booking', error);
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['customer']} portalName="Customer Online Booking Wizard">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Wizard Progress Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Select Service', subtitle: 'Choose package' },
            { num: 2, title: 'Schedule Slot', subtitle: 'Dynamic availability' },
            { num: 3, title: 'Deposit & Confirm', subtitle: '20% lock & address' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-slate-900 text-white'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-xs font-bold ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-500">{s.subtitle}</div>
                </div>
              </div>
              {idx < 2 && (
                <div
                  className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-colors ${
                    step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Select an On-Demand Field Service (Dhaka)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent BDT pricing with doorstep technician dispatch across Dhaka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => {
              const isSelected = selectedService.id === svc.id;
              const dep = (svc.price * svc.deposit_percentage) / 100;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {svc.name}
                          </h3>
                          {isSelected && (
                            <span className="rounded bg-slate-900 p-0.5 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {svc.duration_minutes} mins
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            {formatBDT(dep)} deposit ({svc.deposit_percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">
                          {formatBDT(svc.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Total BDT</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {svc.description}
                    </p>

                    {svc.features && svc.features.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        {svc.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-600">
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Guaranteed on-time arrival window
                    </span>
                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Choose Package'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              Continue to Schedule Slot
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Dynamic Slot Calculation */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Choose Date & Dynamic Slot
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic slot calculation based on {selectedService.duration_minutes}-min duration & technician availability.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs text-slate-500 font-medium">Selected Service</div>
              <div className="text-xs font-bold text-slate-900">{selectedService.name}</div>
            </div>
          </div>

          {/* 7-Day Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Appointment Date
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dateOptions.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {isToday ? 'Today' : format(date, 'EEE')}
                    </span>
                    <span className="text-base font-black mt-0.5">
                      {format(date, 'd')}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {format(date, 'MMM')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Available Slots Grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Available Dynamic Slots ({format(selectedDate, 'MMMM d, yyyy')})
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  🔒 Concurrency Lock Active (FR-03)
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {availableSlots.filter((s) => s.available).length} slots free
                </span>
              </div>
            </div>

            {availableSlots.filter((s) => s.available).length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
                <p className="text-xs font-bold">No available slots for this date</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Operating hours are 8:00 AM - 6:00 PM. Please select another date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const startTime = format(new Date(slot.start), 'h:mm a');
                  const endTime = format(new Date(slot.end), 'h:mm a');
                  const isSelected = selectedSlot?.start === slot.start;

                  if (!slot.available) {
                    return (
                      <div
                        key={slot.start}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-center text-slate-300 cursor-not-allowed opacity-50 text-xs"
                      >
                        <div className="line-through">{startTime} - {endTime}</div>
                        <div className="text-[9px] text-slate-400">Booked</div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex flex-col items-center justify-center rounded-lg p-2.5 border transition-all text-xs font-medium ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold">{startTime}</span>
                      <span className="text-[10px] text-slate-500">to {endTime}</span>
                      {slot.technician_name && (
                        <span className="text-[9px] text-emerald-700 font-medium mt-1">
                          ✓ {slot.technician_name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Services
            </button>
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              Continue to Deposit & Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location, Deposit Calculation & Confirmation */}
      {step === 3 && (
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Confirm Booking & Pay 20% Deposit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pay 20% deposit ({formatBDT(depositAmount)}) to secure your technician. Remaining balance ({formatBDT(remainingBalance)}) is due after job completion.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 space-y-5">
              {/* Location & Contact Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-700" />
                  Service Location & Client Details (Dhaka)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="Tanvir Ahmed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (For SMS ETA)
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
                      placeholder="+880 1711-234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="tanvir.ahmed@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dhaka Service Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAddress}
                    onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="House, Road, Block/Sector, Area, Dhaka"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instructions for Field Technician (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customerNotes}
                    onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="Parking slot, gate code, call upon arrival..."
                  />
                </div>
              </div>

              {/* Payment Method Selector (bKash, Nagad, Card) */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Upfront Deposit Payment Method
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Secure Payment Gateway
                  </span>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50 text-pink-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 text-pink-600" />
                    bKash
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 text-orange-600" />
                    Nagad
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Card
                  </button>
                </div>

                {/* bKash / Nagad input */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                    <div className="text-xs font-bold text-slate-800">
                      {paymentMethod === 'bkash' ? 'bKash Direct Merchant Checkout' : 'Nagad Gateway'}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={formData.bkashNumber}
                          onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                          className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          PIN / OTP (Demo)
                        </label>
                        <input
                          type="password"
                          value={formData.bkashPin}
                          onChange={(e) => setFormData({ ...formData, bkashPin: e.target.value })}
                          className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card input */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={formData.cardCvc}
                          onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Summary & CTA */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-900 bg-slate-900 text-white p-5 shadow-sm space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Booking Summary
                </div>

                <div className="space-y-2 border-b border-slate-800 pb-3">
                  <div className="text-sm font-bold text-white">
                    {selectedService.name}
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    {selectedSlot && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {format(new Date(selectedSlot.start), 'h:mm a')} -{' '}
                        {format(new Date(selectedSlot.end), 'h:mm a')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown in BDT */}
                <div className="space-y-2 text-xs text-slate-300 border-b border-slate-800 pb-3">
                  <div className="flex justify-between">
                    <span>Total Service Value</span>
                    <span className="font-bold text-white">{formatBDT(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Deposit Due Now ({depositPercent}%)</span>
                    <span>{formatBDT(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining Due on Site</span>
                    <span>{formatBDT(remainingBalance)}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-300">Amount Charged Today</span>
                  <span className="text-xl font-black text-white">{formatBDT(depositAmount)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 text-xs sm:text-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Securing Slot...'
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay {formatBDT(depositAmount)} & Confirm
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  Instant confirmation & technician slot lock
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Slots
            </button>
          </div>
        </form>
      )}
      </div>
    </RoleGuard>
  );
}
