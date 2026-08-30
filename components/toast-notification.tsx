'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/20',
    error: 'bg-rose-950 text-white border-rose-600 shadow-rose-950/30',
    info: 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/40',
  };

  const Icon = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-sky-400 shrink-0" />,
  }[toastMessage.type];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-short">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md transition-all ${
          bgStyles[toastMessage.type]
        }`}
      >
        {Icon}
        <p className="text-xs md:text-sm font-medium tracking-tight leading-snug">
          {toastMessage.text}
        </p>
      </div>
    </div>
  );
};
