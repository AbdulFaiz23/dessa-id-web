import React from 'react';
import Link from 'next/link';
import { Sprout, ArrowLeft, Mail, Lock, User, Phone, Tag } from 'lucide-react';
import { signup } from '@/app/auth/actions';

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Left Panel - Visual Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-emerald-900/85 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/50 to-transparent"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center text-white/80 hover:text-white transition w-fit group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-xl">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Mulai Perjalanan Anda di Dessa.id
          </h1>
          <ul className="space-y-4 mb-8">
            {[
              'Iklankan lahan pedesaan Anda langsung ke investor.',
              'Akses peta satelit geospasial presisi.',
              'Transaksi aman tanpa perantara tersembunyi.'
            ].map((item, i) => (
              <li key={i} className="flex items-center text-emerald-50 text-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-32 py-12 relative bg-white overflow-y-auto">
        
        {/* Mobile Back Button */}
        <Link href="/" className="lg:hidden absolute top-8 left-6 sm:left-12 flex items-center text-slate-500 hover:text-emerald-600 transition text-sm font-semibold group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Beranda
        </Link>

        <div className="w-full max-w-md mx-auto animate-fade-in-up mt-8 lg:mt-0">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Buat Akun Baru</h2>
            <p className="text-slate-500 font-medium">
              Sudah punya akun?{' '}
              <Link href="/masuk" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-emerald-600/30 underline-offset-4 transition">
                Masuk di sini
              </Link>
            </p>
          </div>

          {/* Social Logins */}
          <div className="mb-8">
            <button className="w-full flex items-center justify-center px-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98] opacity-50 cursor-not-allowed" title="Fitur dalam pengembangan">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Daftar dengan Google
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">atau daftar dengan email</span>
            </div>
          </div>

          {/* Messages */}
          {searchParams?.message && (
            <div className="p-4 mb-6 rounded-xl text-sm font-bold flex items-center bg-red-50 border border-red-100 text-red-700">
              <div className="w-2 h-2 rounded-full mr-3 bg-red-500" />
              {searchParams.message}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" action={signup}>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Peran Anda</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="role" required className="block w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm font-bold text-slate-900 appearance-none">
                    <option value="seller">Penjual Lahan</option>
                    <option value="investor">Investor Pembeli</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">No. WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="whatsapp_number"
                    type="tel"
                    required
                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm font-medium text-slate-900 placeholder-slate-400"
                    placeholder="081234..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="full_name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm font-medium text-slate-900 placeholder-slate-400"
                  placeholder="Budi Santoso"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm font-medium text-slate-900 placeholder-slate-400"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm font-medium text-slate-900 placeholder-slate-400"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-emerald-600/20 text-sm font-extrabold text-white gradient-emerald hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 active:scale-[0.98]"
              >
                Daftar Sekarang
              </button>
            </div>
            
            <p className="text-[11px] text-center text-slate-500 font-medium mt-6">
              Dengan mendaftar, Anda menyetujui <a href="#" className="text-emerald-600 hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-emerald-600 hover:underline">Kebijakan Privasi</a> Dessa.id.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
