import React from 'react';
import { ShieldCheck, Clock, XCircle, CheckCircle2, Lock, HelpCircle, Star, Shield } from 'lucide-react';
import Script from 'next/script';
import PricingCards from './PricingCards';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SellerSubscriptionPage({
  searchParams
}: {
  searchParams: { message?: string }
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/masuk');
  }

  // Fetch orders from database
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  const myOrders = orders || [];

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-5xl mx-auto">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      
      <div className="text-center mb-12 animate-fade-in-up">
        {searchParams?.message && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl mb-8 text-sm font-bold border border-amber-200 shadow-sm flex items-center justify-center mx-auto max-w-2xl animate-fade-in">
            <ShieldCheck className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
            {searchParams.message}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Pilih Paket Langganan</h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">Tingkatkan visibilitas lahan Anda dan jangkau lebih banyak investor potensial dari seluruh Indonesia.</p>
      </div>

      {/* ===== PRICING CARDS ===== */}
      <PricingCards />

      {/* ===== HISTORY TABLE ===== */}
      <div className="animate-fade-in-up delay-300">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Riwayat Pembayaran</h2>
        
        {myOrders.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
            <p className="text-slate-500">Belum ada riwayat transaksi langganan.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-xs">
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Tanggal</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Order ID</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Paket</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myOrders.map((order) => {
                    // Format Date
                    const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    });
                    
                    // Format Amount
                    const formattedAmount = new Intl.NumberFormat('id-ID', {
                      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                    }).format(order.amount);

                    // Map Status
                    let statusBadge;
                    switch(order.status) {
                      case 'paid':
                        statusBadge = <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center w-max shadow-sm"><ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Lunas</span>;
                        break;
                      case 'pending':
                        statusBadge = <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center w-max shadow-sm"><Clock className="w-3.5 h-3.5 mr-1.5" /> Menunggu</span>;
                        break;
                      case 'failed':
                      case 'expired':
                        statusBadge = <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center w-max shadow-sm"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Gagal</span>;
                        break;
                      default:
                        statusBadge = <span className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center w-max shadow-sm">{order.status}</span>;
                    }

                    return (
                      <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-medium">{orderDate}</td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs whitespace-nowrap">{order.order_id}</td>
                        <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-medium">
                          {order.plan === 'yearly' ? 'Tahunan' : 'Bulanan'} <span className="text-slate-400 font-normal">({formattedAmount})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {statusBadge}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===== TRUST BADGES & PAYMENT METHODS ===== */}
      <div className="mt-20 pt-16 border-t border-slate-200 text-center animate-fade-in-up delay-500">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Pembayaran Aman & Terverifikasi</h3>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-black italic tracking-tighter flex items-center"><span className="text-blue-800">BCA</span></div>
          <div className="text-xl font-black italic text-yellow-500 flex items-center">MANDIRI</div>
          <div className="text-xl font-bold text-blue-600 flex items-center">BRI</div>
          <div className="text-xl font-black text-red-600 flex items-center">BNI</div>
          <div className="text-xl font-bold text-green-500 flex items-center">GoPay</div>
          <div className="text-xl font-bold text-purple-600 flex items-center">OVO</div>
          <div className="text-xl font-bold text-blue-400 flex items-center">DANA</div>
        </div>
        <div className="mt-8 flex justify-center items-center text-xs text-slate-400 font-medium">
          <Lock className="w-3.5 h-3.5 mr-1.5" /> Enkripsi SSL 256-bit • Diproses oleh Midtrans
        </div>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <div className="mt-20 max-w-3xl mx-auto animate-fade-in-up delay-700">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-6 h-6 text-slate-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Pertanyaan Seputar Langganan</h2>
          <p className="text-slate-500">Hal-hal yang sering ditanyakan penjual kami.</p>
        </div>

        <div className="space-y-4">
          {[
            { q: "Metode pembayaran apa saja yang didukung?", a: "Kami mendukung transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, DANA, ShopeePay), hingga kartu kredit melalui gerbang pembayaran Midtrans yang 100% aman." },
            { q: "Apakah langganan saya otomatis diperpanjang?", a: "Tidak. Kami tidak memotong saldo Anda secara otomatis. Anda akan menerima pengingat 7 hari sebelum masa aktif habis untuk memperpanjang secara manual." },
            { q: "Berapa lama proses verifikasi pembayaran?", a: "Hanya hitungan detik! Sistem kami terhubung secara real-time. Begitu pembayaran Anda berhasil, status langganan dan *badge* Premium akan langsung aktif." },
            { q: "Apakah saya bisa membatalkan langganan?", a: "Anda bebas berhenti berlangganan kapan saja dengan tidak memperpanjang masa aktif. Namun, biaya yang sudah dibayarkan tidak dapat dikembalikan." },
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-start">
                <span className="text-emerald-500 mr-2 mt-1">•</span> {faq.q}
              </h4>
              <p className="text-slate-600 ml-5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
