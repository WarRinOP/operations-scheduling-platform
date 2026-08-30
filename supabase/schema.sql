-- ==========================================================
-- OPERATIONS & DYNAMIC SCHEDULING PLATFORM DATABASE SCHEMA
-- PostgreSQL / Supabase DDL
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (RBAC)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Services Catalog (Prices in BDT)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    price NUMERIC(10,2) NOT NULL,
    deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bookings Table (Finite State Machine)
DO $$ BEGIN
    CREATE TYPE job_status AS ENUM (
        'pending', 
        'scheduled', 
        'en_route', 
        'in_progress', 
        'completed', 
        'billed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    service_address TEXT NOT NULL,
    customer_notes TEXT,
    status job_status NOT NULL DEFAULT 'pending',
    deposit_amount NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    customer_signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Audit & Webhook Logs
CREATE TABLE IF NOT EXISTS system_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status job_status,
    new_status job_status NOT NULL,
    triggered_by UUID REFERENCES profiles(id),
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_system_event_logs_booking ON system_event_logs(booking_id);

-- ==========================================================
-- INITIAL SEED DATA
-- ==========================================================

-- Insert Profiles
INSERT INTO profiles (id, full_name, email, phone, role)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tanvir Ahmed', 'tanvir.ahmed@gmail.com', '+880 1711-234567', 'customer'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Kazi Shakil', 'kazi.shakil@opsflow.bd', '+880 1819-345678', 'technician'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Mehedi Hasan', 'mehedi.hasan@opsflow.bd', '+880 1912-456789', 'technician'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Tajwar Hossain (Dispatcher)', 'admin@opsflow.com.bd', '+880 1713-567890', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert Services (BDT)
INSERT INTO services (id, name, description, duration_minutes, price, deposit_percentage, features)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Executive Car Detailing & Steam Wash', 'Complete high-pressure foam wash, exterior polish, interior steam cleaning & AC duct disinfection.', 90, 2500.00, 20.00, '["Foam body wash & hydrophobic glass coat", "High-temperature steam interior sanitation", "Leather/fabric upholstery deep cleaning", "Tire conditioning & alloy rim shine"]'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'Ceramic Paint Protection & Multi-Stage Buffing', 'Professional paint swirl removal, high-gloss machine compound, and ceramic coating protection.', 180, 6500.00, 20.00, '["Dual-action machine swirl correction", "2-Year 9H ceramic coating layer", "Windshield rain-repellent ceramic coat", "Engine bay dust-off & dressing"]'::jsonb),
    ('33333333-3333-3333-3333-333333333333', 'Express Interior Vacuum & AC Foam Sanitization', 'Rapid turnaround interior vacuuming, dashboard UV treatment, AC vent antibacterial foam cleaning.', 45, 1200.00, 20.00, '["Floor mat & trunk industrial vacuum", "Dashboard & door trim UV polish", "AC vent antimicrobial foam spray", "Cabin odor eliminator treatment"]'::jsonb),
    ('44444444-4444-4444-4444-444444444444', 'On-Site Technical Maintenance & Inspection', 'Doorstep 25-point mechanical inspection, coolant & brake fluid top-up, battery health diagnosis.', 60, 1800.00, 20.00, '["25-Point digital vehicle diagnostics", "Coolant, wiper & brake fluid top-up", "Air filter cleaning & spark check", "Battery voltage & alternator test"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert Bookings
INSERT INTO bookings (id, customer_id, technician_id, service_id, scheduled_start, scheduled_end, service_address, customer_notes, status, deposit_amount, total_amount, created_at)
VALUES
    -- Pending Booking
    ('aa000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, '11111111-1111-1111-1111-111111111111', now() + interval '2 hours', now() + interval '3 hours 30 minutes', 'House 42, Road 11, Block D, Banani, Dhaka', 'Basement parking slot B-2.', 'pending', 500.00, 2500.00, now() - interval '1 hour'),
    
    -- Scheduled Booking
    ('aa000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '22222222-2222-2222-2222-222222222222', now() + interval '4 hours', now() + interval '7 hours', 'Plot 15, Road 104, Gulshan-2, Dhaka', 'White Toyota Harrier parked in porch.', 'scheduled', 1300.00, 6500.00, now() - interval '3 hours'),
    
    -- En Route Booking
    ('aa000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '33333333-3333-3333-3333-333333333333', now() + interval '30 minutes', now() + interval '1 hour 15 minutes', 'House 18, Road 27, Dhanmondi, Dhaka', 'Please call upon arrival.', 'en_route', 240.00, 1200.00, now() - interval '4 hours'),
    
    -- In Progress Booking
    ('aa000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '11111111-1111-1111-1111-111111111111', now() - interval '30 minutes', now() + interval '1 hour', 'Sector 4, Road 7, House 23, Uttara, Dhaka', 'Water outlet in garage.', 'in_progress', 500.00, 2500.00, now() - interval '5 hours'),
    
    -- Completed Booking
    ('aa000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '44444444-4444-4444-4444-444444444444', now() - interval '4 hours', now() - interval '3 hours', 'Block I, Road 8, Bashundhara R/A, Dhaka', 'Corporate office bay.', 'completed', 360.00, 1800.00, now() - interval '8 hours'),

    -- Billed Booking
    ('aa000000-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '11111111-1111-1111-1111-111111111111', now() - interval '1 day', now() - interval '1 day' + interval '90 minutes', 'House 5, Road 2, Mirpur DOHS, Dhaka', 'Complete overhaul.', 'billed', 500.00, 2500.00, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert audit logs
INSERT INTO system_event_logs (booking_id, previous_status, new_status, triggered_by, payload, created_at)
VALUES
    ('aa000000-0000-0000-0000-000000000001', NULL, 'pending', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"event": "booking_created", "deposit_received": 500.00, "currency": "BDT"}'::jsonb, now() - interval '1 hour'),
    ('aa000000-0000-0000-0000-000000000002', 'pending', 'scheduled', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '{"event": "technician_assigned", "technician": "Kazi Shakil"}'::jsonb, now() - interval '2 hours 50 minutes'),
    ('aa000000-0000-0000-0000-000000000003', 'scheduled', 'en_route', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '{"event": "technician_en_route", "eta_minutes": 25, "sms_dispatched": true}'::jsonb, now() - interval '25 minutes'),
    ('aa000000-0000-0000-0000-000000000004', 'en_route', 'in_progress', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '{"event": "service_started", "timer_started": true}'::jsonb, now() - interval '30 minutes')
ON CONFLICT DO NOTHING;
