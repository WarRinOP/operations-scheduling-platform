'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { 
  CalendarDays, 
  LayoutDashboard, 
  Smartphone, 
  BarChart3, 
  RotateCcw, 
  ChevronDown, 
  Layers,
  ShieldCheck,
  Wrench,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentProfile, profiles, setCurrentProfile, resetToSeedData, logout } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const allNavItems = [
    { href: '/', label: 'Overview', icon: Layers, roles: ['customer', 'technician', 'admin'] },
    { href: '/book', label: 'Book Service', icon: CalendarDays, roles: ['customer'] },
    { href: '/admin/dispatch', label: 'Dispatch Kanban', icon: LayoutDashboard, roles: ['admin'] },
    { href: '/tech/active-job', label: 'Tech Mobile View', icon: Smartphone, roles: ['technician'] },
    { href: '/admin/analytics', label: 'Analytics & Logs', icon: BarChart3, roles: ['admin'] },
    { href: '/login', label: 'Portal Login', icon: LogIn, roles: ['customer', 'technician', 'admin'] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(currentProfile.role));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-950/80 text-purple-200 border-purple-800';
      case 'technician':
        return 'bg-emerald-950/80 text-emerald-200 border-emerald-800';
      default:
        return 'bg-blue-950/80 text-blue-200 border-blue-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-900 font-black shadow-sm">
              <span className="text-sm tracking-tighter">OPS</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                OpsFlow BD
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
                  Dhaka
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Operations & Scheduling
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-inner'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Role Switcher & Reset Button */}
        <div className="flex items-center gap-2.5">
          {/* Quick Reset Demo Data */}
          <button
            onClick={resetToSeedData}
            title="Reset platform demo seed data"
            className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden xl:inline">Reset</span>
          </button>

          {/* Role Persona Switcher (No human faces, clean initials) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-medium hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center border border-slate-600">
                  {getInitials(currentProfile.full_name)}
                </div>
                <span className="font-semibold text-white truncate max-w-[110px] sm:max-w-none">
                  {currentProfile.full_name}
                </span>
                <span
                  className={`hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(
                    currentProfile.role
                  )}`}
                >
                  {currentProfile.role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-20">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Persona (RBAC)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Role Profiles
                      </p>
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300"
                    >
                      Portal Login ➔
                    </Link>
                  </div>

                  <div className="space-y-1">
                    {profiles.map((p) => {
                      const isSelected = p.id === currentProfile.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setCurrentProfile(p);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-slate-800 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
                              {getInitials(p.full_name)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-100">
                                {p.full_name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {p.email}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(
                              p.role
                            )}`}
                          >
                            {p.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navbar */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-800 px-2 py-2 bg-slate-950/80 overflow-x-auto text-[11px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors whitespace-nowrap ${
                isActive ? 'text-white font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
