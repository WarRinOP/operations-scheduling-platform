'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { 
  ShieldCheck, 
  Wrench, 
  User, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2,
  LogIn
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { profiles, loginAs } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const customer = profiles.find((p) => p.role === 'customer');
  const admin = profiles.find((p) => p.role === 'admin');
  const technicians = profiles.filter((p) => p.role === 'technician');

  const handleQuickLogin = (profileId: string, targetPath: string) => {
    loginAs(profileId);
    router.push(targetPath);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Match by email or selected role
    const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
                    profiles.find((p) => p.role === selectedRole);

    if (matched) {
      loginAs(matched.id);
      if (matched.role === 'customer') router.push('/book');
      else if (matched.role === 'admin') router.push('/admin/dispatch');
      else router.push('/tech/active-job');
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 space-y-8">
      {/* Portal Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          <Lock className="h-3.5 w-3.5 text-slate-600" />
          Role-Based Access Portal (RBAC)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          OpsFlow Unified Portal Login
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select a role persona below for instant 1-click access, or log in with credentials.
        </p>
      </div>

      {/* 3 Role Quick Login Cards (Figma / Prototype friendly) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Customer Card */}
        {customer && (
          <div className="flex flex-col justify-between rounded-xl border border-slate-300 bg-white p-5 shadow-sm hover:border-slate-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm">
                  TA
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Customer
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{customer.full_name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{customer.email}</p>
                <p className="text-[11px] text-slate-500 font-mono">{customer.phone}</p>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Portal Capabilities:</div>
                <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc list-inside">
                  <li>Browse dynamic service catalog</li>
                  <li>Calculate dynamic 30-min slots</li>
                  <li>Pay 20% deposit (bKash / Nagad)</li>
                  <li>Real-time status tracking</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin(customer.id, '/book')}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 text-xs font-bold transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login as Customer
            </button>
          </div>
        )}

        {/* 2. Admin / Dispatcher Card */}
        {admin && (
          <div className="flex flex-col justify-between rounded-xl border-2 border-slate-900 bg-slate-50 p-5 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  TH
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                  Admin / Dispatcher
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{admin.full_name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{admin.email}</p>
                <p className="text-[11px] text-slate-500 font-mono">{admin.phone}</p>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Portal Capabilities:</div>
                <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc list-inside">
                  <li>6-Column Operations Kanban</li>
                  <li>Assign technicians to pending jobs</li>
                  <li>Revenue & MRR analytics in BDT</li>
                  <li>Printable tax invoices</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin(admin.id, '/admin/dispatch')}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 text-xs font-bold transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login as Dispatcher
            </button>
          </div>
        )}

        {/* 3. Field Technician Card */}
        {technicians[0] && (
          <div className="flex flex-col justify-between rounded-xl border border-slate-300 bg-white p-5 shadow-sm hover:border-slate-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                  KS
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Field Technician
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{technicians[0].full_name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{technicians[0].email}</p>
                <p className="text-[11px] text-slate-500 font-mono">{technicians[0].phone}</p>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">Portal Capabilities:</div>
                <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc list-inside">
                  <li>390px Mobile view interface</li>
                  <li>Sequential Action workflow</li>
                  <li>Live on-site work timer</li>
                  <li>HTML5 digital signature sign-off</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(technicians[0].id, '/tech/active-job')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 text-xs font-bold transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login as Kazi Shakil
              </button>
              {technicians[1] && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(technicians[1].id, '/tech/active-job')}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-2 text-[11px] font-semibold transition-colors"
                >
                  Or Login as {technicians[1].full_name}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Standard Form Login (For prototype wireframing) */}
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
          Or Enter Credentials Manually
        </h2>

        <form onSubmit={handleFormLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'admin', 'technician'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-bold capitalize transition-colors ${
                    selectedRole === r
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@opsflow.com.bd"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Sign In to Portal
          </button>
        </form>
      </div>
    </div>
  );
}
