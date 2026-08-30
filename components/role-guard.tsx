'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { ShieldAlert, ArrowRight, LogIn, Lock } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  portalName: string;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  portalName,
  children,
}) => {
  const { currentProfile, profiles, setCurrentProfile } = useApp();

  const isAuthorized = allowedRoles.includes(currentProfile.role);

  if (isAuthorized) {
    return <>{children}</>;
  }

  // Find target profile to recommend quick switch
  const recommendedProfile = profiles.find((p) => allowedRoles.includes(p.role));

  const getMyPortalLink = () => {
    switch (currentProfile.role) {
      case 'technician':
        return { href: '/tech/active-job', label: 'Go to Field Tech Portal' };
      case 'admin':
        return { href: '/admin/dispatch', label: 'Go to Dispatch Kanban' };
      default:
        return { href: '/book', label: 'Go to Customer Booking' };
    }
  };

  const myPortal = getMyPortalLink();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <Lock className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Access Restricted (RBAC)
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            {portalName}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are currently logged in as <strong className="text-slate-800">{currentProfile.full_name}</strong> (<span className="uppercase font-semibold text-slate-700">{currentProfile.role}</span>). This portal requires <span className="font-bold text-slate-900">{allowedRoles.join(' or ').toUpperCase()}</span> authorization.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {recommendedProfile && (
            <button
              type="button"
              onClick={() => setCurrentProfile(recommendedProfile)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              Switch to {recommendedProfile.full_name} ({recommendedProfile.role})
            </button>
          )}

          <Link
            href={myPortal.href}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {myPortal.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
