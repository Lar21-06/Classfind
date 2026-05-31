'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { GraduationCap, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const role = (session?.user as any)?.role;

  const dashboardHref =
    role === 'ADMIN' ? '/admin' :
    role === 'TEACHER' ? '/teacher/dashboard' :
    '/student/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <GraduationCap className="w-7 h-7" />
            <span className="tracking-tight">ClassFind</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/subjects" className="hover:text-indigo-600 transition-colors">Subjects</Link>
            <Link href="/teachers" className="hover:text-indigo-600 transition-colors">Teachers</Link>
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardHref}
                  className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors text-slate-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hover:text-indigo-600 transition-colors">Login</Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link href="/subjects" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>Subjects</Link>
          <Link href="/teachers" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>Teachers</Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="block text-sm font-medium text-indigo-600 py-2" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="block text-sm text-slate-600 py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="block text-sm font-medium text-indigo-600 py-2" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
