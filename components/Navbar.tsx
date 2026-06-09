'use client'

import React, { useState, useEffect } from 'react';
import { Sprout, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/jelajahi', label: 'Jelajahi Lahan' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar({ darkHeader = false }: { darkHeader?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isDarkText = !darkHeader || scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center mr-2.5 shadow-sm group-hover:shadow-md transition-shadow">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className={`font-extrabold text-xl tracking-tight ${isDarkText ? 'text-slate-900' : 'text-white'}`}>
                Dessa<span className={isDarkText ? 'text-emerald-600' : 'text-emerald-400'}>.id</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? (isDarkText ? 'text-emerald-700 bg-emerald-50' : 'text-white bg-white/20')
                        : (isDarkText ? 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50' : 'text-slate-300 hover:text-white hover:bg-white/10')
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className={`w-px h-6 mx-2 ${isDarkText ? 'bg-slate-200' : 'bg-white/20'}`} />
              <Link
                href="/masuk"
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  isDarkText ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Masuk
              </Link>
              <Link href="/daftar">
                <button className="gradient-emerald text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300 active:scale-95">
                  Mulai Jual Lahan
                </button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-xl transition ${isDarkText ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl animate-fade-in-up p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl font-semibold transition ${
                  pathname === link.href
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-slate-100 my-2" />
            <Link
              href="/masuk"
              className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Masuk
            </Link>
            <Link href="/daftar" className="block">
              <button className="w-full gradient-emerald text-white py-3 rounded-xl font-bold shadow-sm">
                Mulai Jual Lahan
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
