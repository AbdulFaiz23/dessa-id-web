'use client'

import React, { useState } from 'react';
import { ShieldAlert, BarChart3, Menu, X, LogOut, Sprout, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Moderasi Antrian', icon: ShieldAlert },
    { href: '/admin/listings', label: 'Manajemen Lahan', icon: Map },
    { href: '/admin/revenue', label: 'Laporan Revenue', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-600">
      
      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-2 border border-emerald-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-slate-900">Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-500 hover:text-slate-900 p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-4 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          <div className="absolute bottom-safe left-0 right-0 p-4 border-t border-slate-200">
            <form action={logout}>
              <button type="submit" className="w-full flex items-center justify-center px-4 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition">
                <LogOut className="w-5 h-5 mr-2" /> Keluar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200">
          <Link href="/" className="flex items-center group mb-6">
            <Sprout className="w-5 h-5 text-emerald-600 mr-2" />
            <span className="font-extrabold text-lg text-slate-900">Dessa.id</span>
          </Link>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mr-3">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 leading-tight">Super Admin</p>
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Portal Kendali</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 mt-4">Menu Utama</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors">
              <LogOut className="w-5 h-5 mr-3" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
