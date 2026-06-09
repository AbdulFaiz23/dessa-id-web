import React from 'react';
import { MapPin, ArrowLeft, ShieldCheck, Maximize, FileText, Share2, CheckCircle2, Phone } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Dynamic import for Leaflet map
import dynamic from 'next/dynamic';
const DetailMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false });

// Generate SEO metadata for each listing (OG tags for WA/FB sharing)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: lahan } = await supabase
    .from('listings')
    .select('title, description, price, photos')
    .eq('id', params.id)
    .eq('status', 'PUBLISHED')
    .single();

  if (!lahan) return { title: 'Lahan Tidak Ditemukan — Dessa.id' };

  const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(lahan.price);

  return {
    title: `${lahan.title} — ${price} | Dessa.id`,
    description: lahan.description?.slice(0, 160) || 'Lihat detail lahan pedesaan di Dessa.id',
    openGraph: {
      title: `${lahan.title} — ${price}`,
      description: lahan.description?.slice(0, 160) || 'Lihat detail lahan pedesaan di Dessa.id',
      images: lahan.photos?.[0] ? [{ url: lahan.photos[0] }] : [],
      type: 'website',
      locale: 'id_ID',
    },
  };
}

export default async function LahanDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: lahan, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'PUBLISHED')
    .single();

  if (error || !lahan) {
    notFound();
  }

  // Fetch seller info
  let ownerName = 'Pemilik Lahan';
  let waNumber = '';

  if (lahan.seller_id) {
    const { data: seller } = await supabase
      .from('users')
      .select('full_name, whatsapp_number')
      .eq('id', lahan.seller_id)
      .single();

    if (seller) {
      ownerName = seller.full_name || 'Pemilik Lahan';
      waNumber = seller.whatsapp_number || '';
    }
  }

  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(lahan.price);
  const imageUrl = lahan.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop';
  const waLink = waNumber
    ? `https://wa.me/${waNumber.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo, saya tertarik dengan lahan "${lahan.title}" yang diiklankan di Dessa.id. Apakah masih tersedia?`)}`
    : '#';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-20 md:pt-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-slate-500">
            <Link href="/jelajahi" className="hover:text-emerald-600 transition flex items-center font-medium">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Jelajahi Lahan
            </Link>
            <span className="mx-2">›</span>
            <span className="text-slate-700 font-medium line-clamp-1">{lahan.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Hero Image */}
        <div className="relative w-full h-64 md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden mb-8 group">
          <img src={imageUrl} alt={lahan.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terverifikasi
            </span>
            <span className="bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              {lahan.document}
            </span>
          </div>

          {/* Share Button */}
          <button className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-sm cursor-pointer hover:bg-white transition text-slate-700">
            <Share2 className="w-5 h-5" />
          </button>

          {/* Price overlay */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <p className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{formattedPrice}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Main Content (Left) */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">{lahan.title}</h1>
            <div className="flex flex-col gap-2 mb-6">
              {lahan.address || lahan.city ? (
                <p className="text-slate-700 flex items-start text-sm">
                  <MapPin className="w-4 h-4 mr-1.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-medium">{[lahan.address, lahan.city].filter(Boolean).join(', ')}</span>
                    <br />
                    <span className="text-slate-400 text-xs">Koordinat: {lahan.lat?.toFixed(6)}, {lahan.lng?.toFixed(6)}</span>
                  </span>
                </p>
              ) : (
                <p className="text-slate-500 flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Koordinat: {lahan.lat?.toFixed(6)}, {lahan.lng?.toFixed(6)}
                </p>
              )}
              {lahan.lat && lahan.lng && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lahan.lat},${lahan.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center w-fit text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Buka di Google Maps
                </a>
              )}
            </div>

            {/* Spec Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Maximize, label: 'Luas Lahan', value: `${lahan.area_sqm?.toLocaleString('id-ID')} m²` },
                { icon: FileText, label: 'Sertifikat', value: lahan.document },
                { icon: ShieldCheck, label: 'Status', value: 'Terverifikasi' },
              ].map((spec) => (
                <div key={spec.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <spec.icon className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="text-slate-500 text-xs block">{spec.label}</span>
                  <span className="font-bold text-slate-900 text-sm">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <h2 className="text-lg font-bold text-slate-900 mb-3">Deskripsi</h2>
            <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-line">
              {lahan.description || 'Tidak ada deskripsi.'}
            </p>

            {/* Map */}
            <h2 className="text-lg font-bold text-slate-900 mb-3">Lokasi di Peta</h2>
            <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              {lahan.lat && lahan.lng ? (
                <DetailMap
                  center={[lahan.lat, lahan.lng]}
                  zoom={15}
                  markers={[
                    {
                      id: lahan.id,
                      lat: lahan.lat,
                      lng: lahan.lng,
                      title: lahan.title,
                      price: lahan.price,
                    },
                  ]}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Lokasi tidak tersedia</p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-6 shadow-sm lg:sticky lg:top-28">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Permintaan</p>
              <p className="text-3xl font-extrabold text-emerald-600 mb-6">{formattedPrice}</p>

              {/* Owner Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Pemilik Lahan</p>
                <div className="flex items-center">
                  <span className="w-10 h-10 gradient-emerald text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm shadow-sm">
                    {ownerName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{ownerName}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1" /> Terverifikasi
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full gradient-emerald text-white font-bold text-base py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300 flex items-center justify-center active:scale-[0.98]">
                  <Phone className="w-5 h-5 mr-2" />
                  Hubungi via WhatsApp
                </button>
              </a>

              <p className="text-[11px] text-center text-slate-400 mt-4 leading-relaxed">
                Dessa.id tidak memungut komisi. Anda langsung terhubung dengan pemilik lahan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
