'use client'

import React, { useState, useEffect } from 'react';
import { Home, CreditCard, PlusCircle, Sprout, Menu, X, LogOut, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('Memuat...');

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        if (data) setUserName(data.full_name);
      }
    };
    fetchUser();
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Ringkasan', icon: Home },
    { href: '/dashboard/listing/baru', label: 'Buat Listing Baru', icon: PlusCircle },
    { href: '/dashboard/langganan', label: 'Langganan & Billing', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      
      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center">
          <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center mr-2">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 leading-tight">Seller</span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{userName.split(' ')[0]}</span>
          </div>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-500 hover:bg-slate-100 p-2 rounded-xl transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4 animate-fade-in-up">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu Penjual</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>
          
          <div className="absolute bottom-safe left-0 right-0 p-4 border-t border-slate-100">
            <form action={logout}>
              <button type="submit" className="w-full flex items-center justify-center px-4 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition">
                <LogOut className="w-5 h-5 mr-2" /> Keluar Akun
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex flex-col">
          <Link href="/" className="flex items-center group mb-6">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight block leading-none mb-1">
                Dessa<span className="text-emerald-600">.id</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller Portal</span>
            </div>
          </Link>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center">
             <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Penjual</p>
               <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
             </div>
          </div>
        </div>
        
        {/* Nav Links */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Menu Penjual</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors">
              <LogOut className="w-5 h-5 mr-3" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 pb-20 md:pb-0 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-emerald-900/5 -z-10" />
        {children}
      </main>

      {/* ===== MOBILE BOTTOM TAB (Optional fallback) ===== */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 min-w-[70px] rounded-xl transition ${
                isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-1 ${isActive ? 'bg-emerald-50' : ''}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
