import React from 'react';
import { MapPin, ShieldCheck, Sprout, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Sprout className="h-8 w-8 text-emerald-600 mr-2" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">Dessa.id</span>
            </div>
            <div className="flex space-x-4 items-center">
              <Link href="/jelajahi" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition">
                Jelajahi Lahan
              </Link>
              <Link href="/masuk">
                <button className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md">
                  Mulai Jual Lahan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Temukan Lahan Pedesaan <br className="hidden md:block"/>
            <span className="text-emerald-600">Terbaik untuk Investasi</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Platform geospasial pertama yang menghubungkan pemilik lahan desa langsung dengan investor perkotaan. Transparan, presisi, dan aman.
          </p>

          {/* Floating Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-full p-2 flex items-center shadow-lg border border-slate-100">
            <div className="flex-grow flex items-center pl-4">
              <MapPin className="h-5 w-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Cari lokasi (misal: Gunungpati, Mijen...)" 
                className="w-full focus:outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            <button className="bg-emerald-600 text-white p-3 md:px-8 rounded-full font-medium hover:bg-emerald-700 transition flex items-center">
              <Search className="h-5 w-5 md:mr-2" />
              <span className="hidden md:block">Cari Lahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fitur / Value Proposition */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Kenapa Memilih Dessa.id?</h2>
            <p className="mt-4 text-slate-600">Solusi digital untuk masalah jual-beli lahan tradisional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geospasial Presisi</h3>
              <p className="text-slate-600 leading-relaxed">
                Tidak ada lagi &quot;lokasi buta&quot;. Setiap listing dilengkapi koordinat satelit akurat agar Anda bisa mensurvei titik secara langsung.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verifikasi Admin</h3>
              <p className="text-slate-600 leading-relaxed">
                Kami memastikan setiap penjual mengunggah identitas dan bukti kepemilikan surat sebelum lahan tayang di platform.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Sprout className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Langsung ke Penjual</h3>
              <p className="text-slate-600 leading-relaxed">
                Tanpa perantara yang menggelembungkan harga. Hubungi pemilik lahan langsung melalui WhatsApp dengan satu klik.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Punya Lahan Terbengkalai di Desa?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Ubah aset Anda menjadi portofolio yang dilihat oleh ribuan calon pembeli potensial dari kota. Daftar sekarang, dapatkan akses gratis 7 hari!
          </p>
          <button className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition shadow-lg flex items-center mx-auto">
            Pasang Iklan Lahan <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
