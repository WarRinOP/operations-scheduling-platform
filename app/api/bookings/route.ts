import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BOOKINGS } from '@/lib/mock-data';
import { validateTransition } from '@/lib/state-machine';
import { Booking, JobStatus } from '@/lib/types';

// In-memory server store for API routes
let serverBookings: Booking[] = [...INITIAL_BOOKINGS];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as JobStatus | null;
  const techId = searchParams.get('technician_id');

  let results = serverBookings;
  if (status) {
    results = results.filter((b) => b.status === status);
  }
  if (techId) {
    results = results.filter((b) => b.technician_id === techId);
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    data: results,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      service_id,
      scheduled_start,
      scheduled_end,
      service_address,
      deposit_amount,
      total_amount,
      customer_notes,
    } = body;

    if (!customer_id || !service_id || !scheduled_start || !scheduled_end || !service_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    const newBooking: Booking = {
      id: `bkg-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      customer_id,
      technician_id: null,
      service_id,
      scheduled_start,
      scheduled_end,
      service_address,
      customer_notes,
      status: 'pending',
      deposit_amount: Number(deposit_amount) || 0,
      total_amount: Number(total_amount) || 0,
      created_at: new Date().toISOString(),
    };

    serverBookings.unshift(newBooking);

    return NextResponse.json({
      success: true,
      message: 'Booking created with status pending.',
      data: newBooking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, new_status, actor_role, technician_id, signature_url } = body;

    const booking = serverBookings.find((b) => b.id === booking_id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID ${booking_id} not found.` },
        { status: 404 }
      );
    }

    // Deterministic state machine validation
    const validation = validateTransition(booking.status, new_status as JobStatus, actor_role);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 422 }
      );
    }

    booking.status = new_status;
    if (technician_id !== undefined) booking.technician_id = technician_id;
    if (signature_url !== undefined) booking.customer_signature_url = signature_url;

    return NextResponse.json({
      success: true,
      message: `Booking transitioned from ${validation} to ${new_status}`,
      data: booking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
