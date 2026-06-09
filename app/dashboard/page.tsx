import React from 'react';
import { AlertCircle, Maximize, FileText, Plus, CheckCircle2, Clock, XCircle, TrendingUp, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/masuk');
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  const myListings = listings || [];

  // Fetch active subscription
  const { data: activeSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'ACTIVE')
    .gt('valid_until', new Date().toISOString())
    .order('valid_until', { ascending: false })
    .limit(1)
    .single();

  let subStatusText = "Belum Langganan";
  let subStatusColor = "text-slate-500";
  let subIconColor = "text-slate-400";
  let subBgColor = "bg-slate-100";
  
  if (activeSub) {
    const daysLeft = Math.ceil((new Date(activeSub.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    subStatusText = `${activeSub.plan === 'YEARLY' ? 'Tahunan' : 'Bulanan'} (Sisa ${daysLeft} hari)`;
    subStatusColor = "text-emerald-600 font-bold";
    subIconColor = "text-emerald-500";
    subBgColor = "bg-emerald-50";
  }

  // Stats calculation
  const publishedCount = myListings.filter(l => l.status === 'PUBLISHED').length;
  const pendingCount = myListings.filter(l => l.status === 'PENDING_REVIEW').length;
  const rejectedCount = myListings.filter(l => l.status === 'REJECTED').length;

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto">
      
      {/* Success Message */}
      {searchParams?.message && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-8 text-sm font-bold border border-emerald-200 shadow-sm flex items-center animate-fade-in-up">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          {searchParams.message}
        </div>
      )}

      {/* Header & Subscription Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Ringkasan Seller</h1>
          <p className="text-slate-500 font-medium">Pantau performa dan kelola listing lahan Anda.</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center shadow-sm w-full lg:w-auto">
          <div className={`w-10 h-10 rounded-xl ${subBgColor} flex items-center justify-center mr-4 flex-shrink-0`}>
            <AlertCircle className={`w-5 h-5 ${subIconColor}`} />
          </div>
          <div className="flex-1 lg:pr-8">
            <h3 className="text-slate-900 font-bold text-sm">Status Langganan</h3>
            <p className={`text-xs mt-0.5 ${subStatusColor}`}>{subStatusText}</p>
          </div>
          <Link href="/dashboard/langganan">
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm whitespace-nowrap">
              {activeSub ? 'Perpanjang' : 'Upgrade'}
            </button>
          </Link>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        {[
          { icon: FileText, label: 'Total Lahan', value: myListings.length, gradient: 'from-slate-800 to-slate-900', iconColor: 'text-white' },
          { icon: CheckCircle2, label: 'Tayang', value: publishedCount, gradient: 'from-emerald-600 to-teal-800', iconColor: 'text-emerald-100' },
          { icon: Clock, label: 'Review', value: pendingCount, gradient: 'from-amber-500 to-orange-700', iconColor: 'text-amber-100' },
          { icon: XCircle, label: 'Ditolak', value: rejectedCount, gradient: 'from-rose-600 to-rose-900', iconColor: 'text-rose-100' }
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.gradient} p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold text-white relative z-10 mb-1 tracking-tight">{stat.value}</p>
            <span className="text-xs md:text-sm font-medium text-white/70 uppercase tracking-wider relative z-10">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Kelola Lahan</h2>
        <Link href="/dashboard/listing/baru">
          <button className="flex items-center gap-2 gradient-emerald text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Baru
          </button>
        </Link>
      </div>

      {/* Premium Empty State */}
      {myListings.length === 0 && (
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 group border border-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
            alt="Mulai Promosi" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
          <div className="relative z-10 p-12 md:p-24 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20">
              <TrendingUp className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Portofolio Lahan Eksklusif Anda</h3>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Bergabunglah dengan ratusan penjual yang telah berhasil mempromosikan aset lahan mereka ke jaringan investor premium kami.
            </p>
            <Link href="/dashboard/listing/baru">
              <button className="bg-emerald-500 text-white font-extrabold px-10 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-95 text-lg flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 mr-2" /> Mulai Listing Pertama
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {myListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((lahan) => {
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(lahan.price);
            const imageUrl = lahan.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop';
              
            const getStatusBadge = (status: string) => {
              switch (status) {
                case 'PUBLISHED':
                  return <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wide flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Tayang</span>;
                case 'PENDING_REVIEW':
                  return <span className="bg-amber-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wide flex items-center"><Clock className="w-3 h-3 mr-1"/> Review</span>;
                case 'REJECTED':
                  return <span className="bg-red-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wide flex items-center"><XCircle className="w-3 h-3 mr-1"/> Ditolak</span>;
                default:
                  return <span className="bg-slate-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wide">{status}</span>;
              }
            };

            return (
              <div key={lahan.id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 flex flex-col group">
                <div className="h-56 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img src={imageUrl} alt={lahan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 z-20 flex space-x-2">
                    {getStatusBadge(lahan.status)}
                  </div>
                  <div className="absolute bottom-4 right-4 z-20">
                    <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {lahan.document}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow relative">
                  <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 z-20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                  </div>
                  
                  <p className="text-emerald-600 text-2xl font-extrabold mb-1 tracking-tight">{formattedPrice}</p>
                  <h3 className="font-bold text-slate-900 text-lg mb-4 line-clamp-1 pr-12">{lahan.title}</h3>
                  
                  <div className="flex items-center space-x-6 text-sm font-medium text-slate-500 mb-6">
                    <span className="flex items-center"><Maximize className="w-4 h-4 mr-2 text-slate-400"/> {lahan.area_sqm} m²</span>
                  </div>
                  
                  <div className="mt-auto flex gap-2 pt-4 border-t border-slate-100">
                    <Link href={`/dashboard/listing/${lahan.id}/edit`} className="w-12 h-12 flex-shrink-0 bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl flex items-center justify-center transition-colors border border-slate-200 hover:border-emerald-200">
                      <Edit className="w-5 h-5" />
                    </Link>
                    {lahan.status === 'PUBLISHED' ? (
                      <Link href={`/lahan/${lahan.id}`} className="flex-1">
                        <button className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-md">
                          Lihat Publik
                        </button>
                      </Link>
                    ) : (
                      <button className="flex-1 h-12 bg-slate-50 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed border border-slate-200">
                        Belum Tayang
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
