'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { MapPin, Maximize, Filter, Sprout, Map as MapIcon, List, X, Search } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Dynamic import for Leaflet (ssr: false) — PRD L-01
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse rounded-2xl">
      <div className="text-center">
        <MapIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-medium">Memuat peta...</p>
      </div>
    </div>
  ),
});

interface Listing {
  id: string;
  title: string;
  price: number;
  area_sqm: number;
  document: string;
  lat: number;
  lng: number;
  city?: string;
  address?: string;
  photos: string[];
  status: string;
  description: string;
}

// Price range filter options
const PRICE_RANGES = [
  { label: 'Semua Harga', min: 0, max: Infinity },
  { label: '< 100 Juta', min: 0, max: 100_000_000 },
  { label: '100 - 500 Juta', min: 100_000_000, max: 500_000_000 },
  { label: '500 Juta - 1 M', min: 500_000_000, max: 1_000_000_000 },
  { label: '> 1 Miliar', min: 1_000_000_000, max: Infinity },
];

const AREA_RANGES = [
  { label: 'Semua Luas', min: 0, max: Infinity },
  { label: '< 500 m²', min: 0, max: 500 },
  { label: '500 - 2000 m²', min: 500, max: 2000 },
  { label: '2000 - 10000 m²', min: 2000, max: 10000 },
  { label: '> 1 Hektar', min: 10000, max: Infinity },
];

const DOC_TYPES = ['Semua', 'SHM', 'SHGB', 'AJB', 'Girik'];

function JelajahiContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list'); // mobile toggle
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [priceFilter, setPriceFilter] = useState(0);
  const [areaFilter, setAreaFilter] = useState(0);
  const [docFilter, setDocFilter] = useState('Semua');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      const supabase = createClient();
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    }
    fetchListings();
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    const priceRange = PRICE_RANGES[priceFilter];
    const areaRange = AREA_RANGES[areaFilter];
    const query = searchQuery.toLowerCase().trim();

    return listings.filter((l) => {
      if (l.price < priceRange.min || l.price > priceRange.max) return false;
      if (l.area_sqm < areaRange.min || l.area_sqm > areaRange.max) return false;
      if (docFilter !== 'Semua' && l.document !== docFilter) return false;
      
      if (query) {
        const titleMatch = l.title.toLowerCase().includes(query);
        const descMatch = (l.description || '').toLowerCase().includes(query);
        const cityMatch = (l.city || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !cityMatch) return false;
      }
      
      return true;
    });
  }, [listings, priceFilter, areaFilter, docFilter, searchQuery]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  // Map markers
  const markers = filtered.map((l) => ({
    id: l.id,
    lat: l.lat,
    lng: l.lng,
    title: l.title,
    price: l.price,
    area: l.area_sqm,
    image: l.photos?.[0] || undefined,
  }));

  const hasActiveFilters = priceFilter !== 0 || areaFilter !== 0 || docFilter !== 'Semua' || searchQuery !== '';

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50">
      {/* ===== LEFT PANEL: Listings & Filters ===== */}
      <div className={`${view === 'map' ? 'hidden lg:flex' : 'flex'} w-full lg:w-[480px] xl:w-[520px] flex-col h-full border-r border-slate-200 bg-white`}>
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center mr-2">
                <Sprout className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">
                Dessa<span className="text-emerald-600">.id</span>
              </span>
            </Link>
            <Link href="/masuk" className="text-slate-500 hover:text-emerald-600 font-semibold text-sm transition">
              Masuk / Daftar
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Jelajahi Lahan</h1>
          <p className="text-slate-500 text-sm mb-4">
            {loading ? 'Memuat...' : `${filtered.length} lahan ditemukan`}
          </p>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama lokasi atau judul lahan..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-900 placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition border ${
                hasActiveFilters
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {[priceFilter !== 0, areaFilter !== 0, docFilter !== 'Semua'].filter(Boolean).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriceFilter(0);
                  setAreaFilter(0);
                  setDocFilter('Semua');
                }}
                className="flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition"
              >
                <X className="w-3 h-3 mr-1" />
                Reset
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rentang Harga</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_RANGES.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setPriceFilter(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        priceFilter === i
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Luas Lahan</label>
                <div className="flex flex-wrap gap-1.5">
                  {AREA_RANGES.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setAreaFilter(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        areaFilter === i
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status Dokumen</label>
                <div className="flex flex-wrap gap-1.5">
                  {DOC_TYPES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDocFilter(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        docFilter === d
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Listing Cards */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Tidak Ada Lahan Ditemukan</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                {hasActiveFilters
                  ? 'Coba ubah filter untuk menemukan lahan yang sesuai.'
                  : 'Listing lahan yang sudah disetujui admin akan muncul di sini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((lahan) => {
                const imageUrl =
                  lahan.photos?.[0] ||
                  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop';

                return (
                  <Link href={`/lahan/${lahan.id}`} key={lahan.id}>
                    <div
                      className={`bg-white border rounded-2xl overflow-hidden group flex flex-col transition-all duration-300 cursor-pointer ${
                        selectedListing === lahan.id
                          ? 'border-emerald-400 shadow-lg shadow-emerald-100'
                          : 'border-slate-100 hover:shadow-lg hover:border-slate-200'
                      }`}
                      onMouseEnter={() => setSelectedListing(lahan.id)}
                      onMouseLeave={() => setSelectedListing(null)}
                    >
                      <div className="h-40 bg-slate-100 relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={lahan.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 shadow-sm border border-white/50">
                          {lahan.document}
                        </div>
                        {(lahan.city || lahan.address) && (
                          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center max-w-[85%]">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> 
                            <span className="truncate">{[lahan.address, lahan.city].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{lahan.title}</h3>
                        <p className="text-emerald-600 text-lg font-extrabold mb-3">{formatPrice(lahan.price)}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                          <span className="flex items-center">
                            <Maximize className="w-3.5 h-3.5 mr-1 opacity-70" /> {lahan.area_sqm} m²
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 opacity-70" /> Lihat Detail →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL: Leaflet Map ===== */}
      <div className={`${view === 'list' ? 'hidden lg:block' : 'block'} flex-1 relative`}>
        <LeafletMap
          markers={markers}
          onMarkerClick={(id) => setSelectedListing(id)}
          className="w-full h-full"
        />
      </div>

      {/* ===== MOBILE VIEW TOGGLE ===== */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setView(view === 'list' ? 'map' : 'list')}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-slate-800 transition flex items-center active:scale-95"
        >
          {view === 'list' ? (
            <>
              <MapIcon className="w-4 h-4 mr-2" /> Lihat Peta
            </>
          ) : (
            <>
              <List className="w-4 h-4 mr-2" /> Lihat Daftar
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function JelajahiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <JelajahiContent />
    </Suspense>
  );
}
