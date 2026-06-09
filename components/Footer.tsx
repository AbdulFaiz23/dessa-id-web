import React from 'react';
import { Sprout, MapPin, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center mr-2.5">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Dessa<span className="text-emerald-400">.id</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Platform promosi lahan pedesaan nomor satu di Indonesia. Transparan, aman, dan berbasis data geospasial.
            </p>
            <div className="flex items-center text-sm text-slate-500">
              <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
              Semarang, Jawa Tengah
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Navigasi</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/jelajahi" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  Jelajahi Lahan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  Dashboard Penjual
                </Link>
              </li>
              <li>
                <Link href="/dashboard/langganan" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  Paket Langganan
                </Link>
              </li>
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Informasi</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-slate-400 cursor-default">Syarat & Ketentuan</span>
              </li>
              <li>
                <span className="text-sm text-slate-400 cursor-default">Kebijakan Privasi</span>
              </li>
              <li>
                <span className="text-sm text-slate-400 cursor-default">FAQ</span>
              </li>
              <li>
                <span className="text-sm text-slate-400 cursor-default">Panduan Penjual</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-slate-400">
                <Mail className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                info@dessa.id
              </li>
              <li className="flex items-center text-sm text-slate-400">
                <Phone className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                +62 812-3456-7890
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-2">Dukung kami:</p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-xs font-bold text-slate-400 hover:text-white">IG</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-xs font-bold text-slate-400 hover:text-white">FB</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-xs font-bold text-slate-400 hover:text-white">YT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Dessa.id — Mohammad Abdul Faiz · A11.2023.15305
          </p>
          <p className="text-xs text-slate-600 mt-2 sm:mt-0">
            Dibangun dengan ❤️ untuk Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
