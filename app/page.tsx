'use client'

import React, { useState, useEffect } from 'react';
import { MapPin, ShieldCheck, Sprout, Search, ArrowRight, TrendingUp, Users, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, started]);

  return { count, start: () => setStarted(true), started };
}

// Intersection Observer hook for scroll animations
function useInView(threshold: number = 0.2) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref);
        }
      },
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, inView };
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Counters
  const kabCounter = useCounter(15, 1500);
  const verifCounter = useCounter(100, 1500);
  const responsCounter = useCounter(24, 1500);
  const tipeCounter = useCounter(3, 1500);

  // Intersection observers for animations
  const statsSection = useInView();
  const featuresSection = useInView();
  const howItWorksSection = useInView();
  const ctaSection = useInView();

  // Start counters when stats section comes into view
  useEffect(() => {
    if (statsSection.inView) {
      kabCounter.start();
      verifCounter.start();
      responsCounter.start();
      tipeCounter.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsSection.inView]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/jelajahi?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = '/jelajahi';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar darkHeader={true} />

      {/* ===== PREMIUM HERO SECTION ===== */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
            alt="Pemandangan Lahan"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-8 animate-fade-in-up backdrop-blur-md">
              <Sprout className="w-4 h-4 mr-2 text-emerald-400" />
              <span className="tracking-widest uppercase">Temukan Lahan Terbaik, Investasi Lebih Cerdas</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 animate-fade-in-up delay-100 leading-tight">
              Investasi Lahan
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm">Lebih Cerdas.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-fade-in-up delay-200">
              Mendigitalisasi aset lahan desa, menghubungkan pemilik langsung dengan investor perkotaan. Transparan, eksklusif, tanpa perantara.
            </p>

            {/* Floating Search Bar */}
            <div className="max-w-2xl mx-auto animate-fade-in-up delay-300 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-2 flex items-center border border-white/20 hover:bg-white/20 transition duration-300">
                <div className="flex-grow flex items-center pl-5">
                  <MapPin className="h-5 w-5 text-emerald-400 mr-4 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Cari lokasi premium (misal: Gunungpati, Salatiga...)"
                    className="w-full bg-transparent focus:outline-none text-white placeholder-slate-400 text-sm md:text-base py-3"
                    id="hero-search"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-white text-slate-900 p-3 md:px-8 md:py-3.5 rounded-xl font-bold hover:bg-emerald-50 transition-all duration-300 flex items-center active:scale-95 flex-shrink-0"
                >
                  <Search className="h-5 w-5 md:mr-2" />
                  <span className="hidden md:block">Jelajahi Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section ref={statsSection.ref} className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y-0 md:divide-x divide-slate-800">
            {[
              { icon: MapPin, label: 'Kabupaten Terjangkau', value: kabCounter.count, prefix: '', suffix: '' },
              { icon: ShieldCheck, label: 'Terverifikasi GPS', value: verifCounter.count, prefix: '', suffix: '%' },
              { icon: Search, label: 'Waktu Respons', value: responsCounter.count, prefix: '< ', suffix: ' Jam' },
              { icon: Sprout, label: 'Tipe Lahan Tersedia', value: tipeCounter.count, prefix: '', suffix: '' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-6 md:py-0 ${statsSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
                  <stat.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                  {stat.prefix}<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{stat.value.toLocaleString('id-ID')}</span>{stat.suffix}
                </p>
                <p className="text-xs md:text-sm text-slate-400 font-medium uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PREMIUM BENTO FEATURES ===== */}
      <section ref={featuresSection.ref} className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 ${featuresSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">Keunggulan Eksklusif</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Standar Baru Investasi Lahan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-[300px]">
            {/* Bento Item 1: Large Image Feature */}
            <div className={`md:col-span-8 rounded-[2rem] overflow-hidden relative group ${featuresSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop" alt="Lokasi Akurat" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
                <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 flex items-center justify-center mb-4">
                  <MapPin className="text-white w-6 h-6" />
                </div>
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">Lokasi Tepat & Akurat</h4>
                <p className="text-slate-300 max-w-lg text-sm md:text-base leading-relaxed">
                  Setiap listing lahan dilengkapi dengan titik koordinat terintegrasi. Anda dapat memantau lokasi persis dan memperkirakan jarak secara digital dengan mudah sebelum survei ke lapangan.
                </p>
              </div>
            </div>

            {/* Bento Item 2: Small Feature */}
            <div className={`md:col-span-4 bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center group hover:border-emerald-200 transition duration-300 ${featuresSection.inView ? 'animate-fade-in-up' : 'opacity-0'} delay-100`}>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <ShieldCheck className="text-blue-600 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Verifikasi Berlapis</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Keamanan adalah kemewahan. Kami memastikan keabsahan dokumen dari setiap penjual sebelum tayang.
              </p>
            </div>

            {/* Bento Item 3: Small Feature */}
            <div className={`md:col-span-5 bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col justify-center relative overflow-hidden group ${featuresSection.inView ? 'animate-fade-in-up' : 'opacity-0'} delay-200`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition duration-500"></div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                <Sprout className="text-emerald-400 w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3 relative z-10">Tanpa Perantara</h4>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Akses eksklusif langsung ke pemilik lahan. Hapus biaya makelar dan negosiasi untuk harga yang sesungguhnya.
              </p>
            </div>

            {/* Bento Item 4: Image Feature */}
            <div className={`md:col-span-7 rounded-[2rem] overflow-hidden relative group ${featuresSection.inView ? 'animate-fade-in-up' : 'opacity-0'} delay-300`}>
              <img src="https://images.unsplash.com/photo-1592595896616-c37162298647?q=80&w=1200&auto=format&fit=crop" alt="Premium Design" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 md:p-12 flex flex-col justify-end">
                <h4 className="text-2xl font-bold text-white mb-2">Pengalaman Bintang Lima</h4>
                <p className="text-slate-300 text-sm max-w-md">Desain antarmuka intuitif yang memanjakan mata, membuat pencarian aset Anda menjadi perjalanan yang menyenangkan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREMIUM HOW IT WORKS ===== */}
      <section ref={howItWorksSection.ref} className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 skew-x-12 translate-x-32 hidden lg:block"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 ${howItWorksSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">Cara Kerja</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Sederhana & Efisien</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                step: '01',
                title: 'Daftar & Pilih Paket',
                desc: 'Bergabung sebagai penjual eksklusif. Pilih paket langganan yang sesuai dengan kebutuhan portofolio Anda.',
                img: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=800&auto=format&fit=crop'
              },
              {
                step: '02',
                title: 'Unggah Aset',
                desc: 'Masukkan detail presisi, foto berkualitas, dan koordinat lahan. Sistem kami memverifikasi secara otomatis.',
                img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop'
              },
              {
                step: '03',
                title: 'Jangkau Investor',
                desc: 'Aset Anda siap dipasarkan. Terima penawaran langsung dari investor perkotaan tanpa hambatan.',
                img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop'
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className={`relative group ${howItWorksSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 shadow-xl relative">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-extrabold text-xl border border-white/30">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PREMIUM CTA SECTION ===== */}
      <section ref={ctaSection.ref} className="py-24 md:py-32 relative overflow-hidden">
        {/* Rich Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop"
            alt="CTA Background"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
        </div>

        <div className={`relative z-10 max-w-5xl mx-auto px-4 text-center ${ctaSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold mb-8 backdrop-blur-md">
            🌿 Bergabung Bersama Kami
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
            Mulai Promosikan Aset
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Lahan Anda Hari Ini.</span>
          </h2>
          <p className="text-slate-300 mb-12 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Platform eksklusif untuk mempertemukan aset desa potensial Anda dengan investor kota yang tepat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/daftar">
              <button className="bg-white text-slate-900 px-8 py-4 md:px-10 md:py-5 rounded-2xl font-extrabold hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_rgba(5,150,105,0.3)] hover:shadow-[0_0_60px_rgba(5,150,105,0.5)] flex items-center justify-center group active:scale-95 text-lg">
                Pasang Iklan Sekarang
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/jelajahi">
              <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-lg mt-4 sm:mt-0">
                Jelajahi Listing
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
