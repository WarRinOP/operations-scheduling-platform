import { Booking, Service, Profile, TimeSlot } from './types';
import { addMinutes, format, isAfter, isBefore, parseISO, setHours, setMinutes, startOfDay } from 'date-fns';

export interface AvailabilityOptions {
  date: Date;
  service: Service;
  existingBookings: Booking[];
  technicians: Profile[];
  businessStartHour?: number; // default 8 (8:00 AM)
  businessEndHour?: number;   // default 18 (6:00 PM)
  bufferMinutes?: number;     // default 15 mins travel/prep buffer
}

/**
 * Calculates dynamic time slots for a given date and service duration.
 * Checks against existing technician bookings and buffer times.
 */
export function calculateAvailableSlots(options: AvailabilityOptions): TimeSlot[] {
  const {
    date,
    service,
    existingBookings,
    technicians,
    businessStartHour = 8,
    businessEndHour = 18,
    bufferMinutes = 15,
  } = options;

  const activeTechnicians = technicians.filter((t) => t.role === 'technician');
  const serviceDuration = service.duration_minutes || 60;
  const totalSlotNeededMinutes = serviceDuration + bufferMinutes;

  const dayStart = setMinutes(setHours(startOfDay(date), businessStartHour), 0);
  const dayEnd = setMinutes(setHours(startOfDay(date), businessEndHour), 0);

  const slots: TimeSlot[] = [];
  const slotIntervalMinutes = 30; // generate 30-min start time candidates

  let currentSlotStart = dayStart;

  // Filter bookings for this selected date (excluding billed / cancelled if any)
  const dayBookings = existingBookings.filter((b) => {
    if (b.status === 'billed') return false; // finished and off calendar or still on schedule
    try {
      const bStart = parseISO(b.scheduled_start);
      return format(bStart, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    } catch {
      return false;
    }
  });

  const now = new Date();

  while (isBefore(addMinutes(currentSlotStart, serviceDuration), dayEnd) || 
         format(addMinutes(currentSlotStart, serviceDuration), 'HH:mm') === format(dayEnd, 'HH:mm')) {
    const slotEnd = addMinutes(currentSlotStart, serviceDuration);

    // If selected date is today, ignore slots in the past
    const isPastSlot = isBefore(currentSlotStart, now);

    if (isPastSlot) {
      slots.push({
        start: currentSlotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: false,
      });
      currentSlotStart = addMinutes(currentSlotStart, slotIntervalMinutes);
      continue;
    }

    // Check which technicians are free during [currentSlotStart, slotEnd + buffer]
    const availableTech = activeTechnicians.find((tech) => {
      const hasConflict = dayBookings.some((booking) => {
        if (booking.technician_id && booking.technician_id !== tech.id) {
          return false; // booked with someone else
        }

        const bStart = parseISO(booking.scheduled_start);
        const bEnd = addMinutes(parseISO(booking.scheduled_end), bufferMinutes);

        // Overlap condition: start < bEnd AND end > bStart
        const overlaps = isBefore(currentSlotStart, bEnd) && isAfter(slotEnd, bStart);
        return overlaps;
      });

      return !hasConflict;
    });

    const isAvailable = !isPastSlot && (activeTechnicians.length === 0 || !!availableTech);

    slots.push({
      start: currentSlotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: isAvailable,
      technician_id: availableTech?.id,
      technician_name: availableTech?.full_name,
    });

    currentSlotStart = addMinutes(currentSlotStart, slotIntervalMinutes);
  }

  return slots;
}
