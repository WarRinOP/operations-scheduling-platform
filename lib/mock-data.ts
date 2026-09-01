import { Profile, Service, Booking, SystemEventLog } from './types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    full_name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@gmail.com',
    phone: '+880 1711-234567',
    role: 'customer',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    full_name: 'Kazi Shakil',
    email: 'kazi.shakil@opsflow.bd',
    phone: '+880 1819-345678',
    role: 'technician',
    skills: ['Ceramic Paint Protection', 'Machine Swirl Buffing', 'Mechanical Diagnostics'],
    assigned_zone: 'Zone 1: Gulshan / Banani / Uttara',
    rating: 4.9,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    full_name: 'Mehedi Hasan',
    email: 'mehedi.hasan@opsflow.bd',
    phone: '+880 1912-456789',
    role: 'technician',
    skills: ['Executive Car Detailing', 'Interior Steam Sanitization', 'AC Foam Treatment'],
    assigned_zone: 'Zone 2: Dhanmondi / Mirpur / Mohammadpur',
    rating: 4.8,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    full_name: 'Tajwar Hossain',
    email: 'admin@opsflow.com.bd',
    phone: '+880 1713-567890',
    role: 'admin',
    assigned_zone: 'Dhaka Operations Central',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Executive Car Detailing & Steam Wash',
    description: 'Complete high-pressure foam wash, exterior polish, interior steam cleaning & AC duct disinfection.',
    duration_minutes: 90,
    price: 2500.00,
    deposit_percentage: 20.00,
    features: [
      'Foam body wash & hydrophobic glass coat',
      'High-temperature steam interior sanitation',
      'Leather/fabric upholstery deep cleaning',
      'Tire conditioning & alloy rim shine',
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Ceramic Paint Protection & Multi-Stage Buffing',
    description: 'Professional paint swirl removal, high-gloss machine compound, and ceramic coating protection.',
    duration_minutes: 180,
    price: 6500.00,
    deposit_percentage: 20.00,
    features: [
      'Dual-action machine swirl correction',
      '2-Year 9H ceramic coating layer',
      'Windshield rain-repellent ceramic coat',
      'Engine bay dust-off & dressing',
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Express Interior Vacuum & AC Foam Sanitization',
    description: 'Rapid turnaround interior vacuuming, dashboard UV treatment, AC vent antibacterial foam cleaning.',
    duration_minutes: 45,
    price: 1200.00,
    deposit_percentage: 20.00,
    features: [
      'Floor mat & trunk industrial vacuum',
      'Dashboard & door trim UV polish',
      'AC vent antimicrobial foam spray',
      'Cabin odor eliminator treatment',
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'On-Site Technical Maintenance & Inspection',
    description: 'Doorstep 25-point mechanical inspection, coolant & brake fluid top-up, battery health diagnosis.',
    duration_minutes: 60,
    price: 1800.00,
    deposit_percentage: 20.00,
    features: [
      '25-Point digital vehicle diagnostics',
      'Coolant, wiper & brake fluid top-up',
      'Air filter cleaning & spark check',
      'Battery voltage & alternator test',
    ],
  },
];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_LOGS: SystemEventLog[] = [];
