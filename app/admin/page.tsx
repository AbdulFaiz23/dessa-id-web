import React from 'react';
import { Check, X, Eye, ShieldAlert, Sparkles, MapPin, Maximize, FileText, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { updateListingStatus } from '@/app/admin/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminQueuePage() {
  const supabase = createClient();
  
  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Fetch PENDING_REVIEW listings with seller details
  const { data: pendingListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users(full_name, whatsapp_number)
    `)
    .eq('status', 'PENDING_REVIEW')
    .order('created_at', { ascending: true });

  const queue = pendingListings || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Premium Header */}
      <div className="relative mb-10 p-8 rounded-[2rem] bg-white border border-slate-200 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold mb-4">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Moderasi Aktif
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Moderasi Antrian</h1>
            <p className="text-slate-500 font-medium max-w-xl">Review dan setujui listing lahan dengan teliti sebelum tayang ke jaringan investor.</p>
          </div>
          <div className="bg-slate-50/50 backdrop-blur-md border border-slate-200/80 px-5 py-3 rounded-2xl flex items-center shadow-inner">
            <span className="text-amber-500 font-extrabold text-2xl mr-3">{queue.length}</span>
            <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider leading-tight">Menunggu<br/>Review</span>
          </div>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] p-16 md:p-24 text-center animate-fade-in relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-b from-slate-50 to-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
              <Sparkles className="w-10 h-10 text-emerald-500 animate-pulse-glow" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Antrian Bersih!</h3>
            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
              Luar biasa! Tidak ada listing lahan yang perlu direview saat ini. Anda telah menyelesaikan semua tugas moderasi dengan baik.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {queue.map((lahan) => {
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(lahan.price);
            const imageUrl = lahan.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop';
            const seller = lahan.seller as { full_name: string, whatsapp_number: string } | undefined;

            return (
              <div key={lahan.id} className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-6 animate-fade-in-up hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group">
                
                {/* Image */}
                <div className="w-full sm:w-56 h-48 bg-slate-100 rounded-2xl overflow-hidden relative flex-shrink-0">
                  <img src={imageUrl} alt={lahan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-amber-100/90 backdrop-blur-sm text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm flex items-center border border-amber-200">
                    <Clock className="w-3 h-3 mr-1.5" /> PENDING
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-1.5 line-clamp-1">{lahan.title}</h3>
                  <p className="text-emerald-600 font-extrabold text-lg mb-4">{formattedPrice}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs font-medium text-slate-600 flex items-center border border-slate-100">
                      <Maximize className="w-4 h-4 mr-2 text-slate-400"/> {lahan.area_sqm} m²
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs font-medium text-slate-600 flex items-center border border-slate-100">
                      <FileText className="w-4 h-4 mr-2 text-slate-400"/> {lahan.document}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs font-medium text-slate-600 flex items-center border border-slate-100 col-span-2">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400"/> {lahan.lat.toFixed(4)}, {lahan.lng.toFixed(4)}
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-3 mb-5 border border-slate-100 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 text-slate-600 font-bold text-xs">
                      {seller?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Penjual</span>
                      <div className="text-slate-900 font-medium text-sm flex items-center gap-2">
                        {seller?.full_name || 'Tanpa Nama'} <span className="text-slate-300">•</span> <span className="text-slate-500">{seller?.whatsapp_number || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-3">
                    <form action={async (formData) => {
                      'use server'
                      await updateListingStatus(formData)
                    }} className="flex-1">
                      <input type="hidden" name="id" value={lahan.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </button>
                    </form>
                    
                    <form action={async (formData) => {
                      'use server'
                      await updateListingStatus(formData)
                    }} className="flex-1">
                      <input type="hidden" name="id" value={lahan.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" className="w-full bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center transition-all active:scale-95">
                        <X className="w-4 h-4 mr-2" /> Reject
                      </button>
                    </form>

                    <Link href={`/lahan/${lahan.id}`} target="_blank" className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold px-4 py-3.5 rounded-xl transition flex items-center justify-center group-hover:border-slate-300">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
