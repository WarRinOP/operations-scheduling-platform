'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Booking, JobStatus, Profile, Service, SystemEventLog, UserRole } from './types';
import { INITIAL_BOOKINGS, INITIAL_LOGS, INITIAL_PROFILES, INITIAL_SERVICES } from './mock-data';
import { validateTransition, STATE_METADATA } from './state-machine';

interface AppContextType {
  // Current user / role
  currentProfile: Profile;
  setCurrentProfile: (profile: Profile) => void;
  switchRole: (role: UserRole, profileId?: string) => void;
  loginAs: (profileId: string) => void;
  logout: () => void;
  
  // Data collections
  profiles: Profile[];
  services: Service[];
  bookings: Booking[];
  logs: SystemEventLog[];
  
  // Actions
  createBooking: (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (
    bookingId: string, 
    newStatus: JobStatus, 
    extra?: { 
      signatureUrl?: string; 
      technicianId?: string;
      customPayload?: Record<string, any>;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  assignTechnician: (bookingId: string, technicianId: string) => Promise<{ success: boolean; error?: string }>;
  resetToSeedData: () => void;
  
  // Notification toast
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  PROFILES: 'osp_profiles_v4',
  SERVICES: 'osp_services_v4',
  BOOKINGS: 'osp_bookings_v4',
  LOGS: 'osp_logs_v4',
  CURRENT_USER_ID: 'osp_current_user_id_v4',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [logs, setLogs] = useState<SystemEventLog[]>(INITIAL_LOGS);
  
  // Default to Tajwar Hossain (Admin/Dispatcher)
  const [currentProfile, setCurrentProfile] = useState<Profile>(INITIAL_PROFILES[3]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const storedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      if (storedProfiles) setProfiles(JSON.parse(storedProfiles));
      if (storedServices) setServices(JSON.parse(storedServices));
      if (storedBookings) setBookings(JSON.parse(storedBookings));
      if (storedLogs) setLogs(JSON.parse(storedLogs));

      if (storedUserId) {
        const found = (storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES).find(
          (p: Profile) => p.id === storedUserId
        );
        if (found) setCurrentProfile(found);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentProfile.id);
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }, [profiles, services, bookings, logs, currentProfile, isHydrated]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const switchRole = (role: UserRole, profileId?: string) => {
    if (profileId) {
      const target = profiles.find((p) => p.id === profileId);
      if (target) {
        setCurrentProfile(target);
        showToast(`Logged in as ${target.full_name} (${target.role.toUpperCase()})`, 'info');
        return;
      }
    }
    const matching = profiles.find((p) => p.role === role);
    if (matching) {
      setCurrentProfile(matching);
      showToast(`Logged in as ${matching.full_name} (${matching.role.toUpperCase()})`, 'info');
    }
  };

  const loginAs = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setCurrentProfile(target);
      showToast(`Welcome back, ${target.full_name}! (${target.role.toUpperCase()} Portal)`, 'success');
    }
  };

  const logout = () => {
    // Reset to Customer or show logged out
    const defaultCust = profiles.find((p) => p.role === 'customer') || INITIAL_PROFILES[0];
    setCurrentProfile(defaultCust);
    showToast('Logged out of portal', 'info');
  };

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>
  ): Promise<Booking> => {
    const newId = `bkg-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const newLog: SystemEventLog = {
      id: `log-${Date.now()}`,
      booking_id: newId,
      previous_status: null,
      new_status: 'pending',
      triggered_by: currentProfile.id,
      payload: {
        event: 'booking_created',
        service_id: bookingData.service_id,
        deposit_paid: `৳${bookingData.deposit_amount.toFixed(2)}`,
        total: `৳${bookingData.total_amount.toFixed(2)}`,
        channel: 'Customer Booking Portal',
      },
      created_at: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setLogs((prev) => [newLog, ...prev]);
    showToast(`Booking #${newId.slice(-6).toUpperCase()} created & deposit locked!`, 'success');
    return newBooking;
  };

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: JobStatus,
    extra?: {
      signatureUrl?: string;
      technicianId?: string;
      customPayload?: Record<string, any>;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    // Finite state machine validation check
    const validation = validateTransition(booking.status, newStatus, currentProfile.role);
    if (!validation.valid) {
      showToast(validation.error || 'Transition denied by state machine rules.', 'error');
      return { success: false, error: validation.error };
    }

    const updatedBooking: Booking = {
      ...booking,
      status: newStatus,
      technician_id: extra?.technicianId !== undefined ? extra.technicianId : booking.technician_id,
      customer_signature_url: extra?.signatureUrl !== undefined ? extra.signatureUrl : booking.customer_signature_url,
    };

    const newLog: SystemEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      booking_id: bookingId,
      previous_status: booking.status,
      new_status: newStatus,
      triggered_by: currentProfile.id,
      payload: {
        event: `transition_to_${newStatus}`,
        actor_name: currentProfile.full_name,
        actor_role: currentProfile.role,
        ...extra?.customPayload,
      },
      created_at: new Date().toISOString(),
    };

    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)));
    setLogs((prev) => [newLog, ...prev]);

    const stateInfo = STATE_METADATA[newStatus];
    showToast(`Job status advanced to "${stateInfo?.label || newStatus}"`, 'success');

    // Auto-advance Completed -> Billed if completed
    if (newStatus === 'completed') {
      setTimeout(() => {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: 'billed' }
              : b
          )
        );
        const autoBillingLog: SystemEventLog = {
          id: `log-auto-bill-${Date.now()}`,
          booking_id: bookingId,
          previous_status: 'completed',
          new_status: 'billed',
          triggered_by: null,
          payload: {
            event: 'automated_invoice_settlement',
            status: 'paid_in_full',
            system_worker: 'Autonomous Billing Bot',
          },
          created_at: new Date().toISOString(),
        };
        setLogs((prev) => [autoBillingLog, ...prev]);
        showToast(`Automated Worker settled Invoice #${bookingId.slice(-6).toUpperCase()}`, 'info');
      }, 1500);
    }

    return { success: true };
  };

  const assignTechnician = async (
    bookingId: string,
    technicianId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    const tech = profiles.find((p) => p.id === technicianId);
    if (!tech) return { success: false, error: 'Technician not found' };

    return updateBookingStatus(bookingId, 'scheduled', {
      technicianId,
      customPayload: {
        assigned_staff: tech.full_name,
        assigned_by: currentProfile.full_name,
      },
    });
  };

  const resetToSeedData = () => {
    setProfiles(INITIAL_PROFILES);
    setServices(INITIAL_SERVICES);
    setBookings(INITIAL_BOOKINGS);
    setLogs(INITIAL_LOGS);
    setCurrentProfile(INITIAL_PROFILES[3]); // Tajwar Hossain
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILES);
      localStorage.removeItem(STORAGE_KEYS.SERVICES);
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {}
    showToast('Platform reset to 0 active jobs (ready for live demo)', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentProfile,
        setCurrentProfile,
        switchRole,
        loginAs,
        logout,
        profiles,
        services,
        bookings,
        logs,
        createBooking,
        updateBookingStatus,
        assignTechnician,
        resetToSeedData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
