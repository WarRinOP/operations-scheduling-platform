import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/navbar';
import { ToastNotification } from '@/components/toast-notification';

export const metadata: Metadata = {
  title: 'OpsFlow | Operations & Dynamic Scheduling Platform',
  description:
    'Lightweight on-demand operations & dynamic scheduling platform with deterministic finite state machine, RBAC, mobile technician signature capture, and operations dispatch kanban.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="flex min-h-full flex-col font-sans antialiased text-slate-900 bg-slate-50 selection:bg-slate-900 selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <ToastNotification />
        </AppProvider>
      </body>
    </html>
  );
}
