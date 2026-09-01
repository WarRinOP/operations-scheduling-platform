export type UserRole = 'customer' | 'technician' | 'admin';

export type JobStatus = 
  | 'pending'
  | 'scheduled'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'billed';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  skills?: string[];
  assigned_zone?: string;
  rating?: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number; // in BDT (৳)
  deposit_percentage: number;
  features?: string[];
}

export interface Booking {
  id: string;
  customer_id: string;
  technician_id: string | null;
  service_id: string;
  scheduled_start: string;
  scheduled_end: string;
  service_address: string;
  customer_notes?: string;
  status: JobStatus;
  deposit_amount: number;
  total_amount: number;
  customer_signature_url?: string | null;
  created_at: string;
  
  // Relations
  customer?: Profile;
  technician?: Profile;
  service?: Service;
}

export interface SystemEventLog {
  id: string;
  booking_id: string;
  previous_status: JobStatus | null;
  new_status: JobStatus;
  triggered_by: string | null;
  payload?: Record<string, any>;
  created_at: string;
  triggered_by_profile?: Profile;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  technician_id?: string;
  technician_name?: string;
}

export function formatBDT(amount: number): string {
  return `৳${Math.round(amount).toLocaleString('en-BD')}`;
}
