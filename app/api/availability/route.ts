import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_BOOKINGS, INITIAL_PROFILES, INITIAL_SERVICES } from '@/lib/mock-data';
import { calculateAvailableSlots } from '@/lib/scheduling';
import { parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('service_id');
  const dateStr = searchParams.get('date');

  const service = INITIAL_SERVICES.find((s) => s.id === serviceId) || INITIAL_SERVICES[0];
  const date = dateStr ? parseISO(dateStr) : new Date();

  const slots = calculateAvailableSlots({
    date,
    service,
    existingBookings: INITIAL_BOOKINGS,
    technicians: INITIAL_PROFILES.filter((p) => p.role === 'technician'),
  });

  return NextResponse.json({
    success: true,
    service_id: service.id,
    date: date.toISOString(),
    slots,
  });
}
