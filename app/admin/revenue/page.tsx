import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart3, Users, Crown, TrendingUp } from 'lucide-react';

export default async function AdminRevenuePage() {
  const supabase = createClient();
  
  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Fetch subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      user:users(full_name, email, whatsapp_number)
    `)
    .order('created_at', { ascending: false });

  const subs = subscriptions || [];

  // Calculate metrics
  const activeSubs = subs.filter(s => s.status === 'ACTIVE');
  const activeCount = activeSubs.length;
  
  // Simplified revenue calculation based on plans
  const totalRevenue = activeSubs.reduce((acc, sub) => {
    return acc + (sub.plan === 'YEARLY' ? 450000 : 49000);
  }, 0);

  const formattedRevenue = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalRevenue);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Laporan Revenue</h1>
        <p className="text-slate-500 font-medium">Pantau pendapatan dari paket langganan penjual (Midtrans).</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center text-emerald-600 mb-4">
            <BarChart3 className="w-5 h-5 mr-2" />
            <span className="font-bold text-sm uppercase tracking-wider">Total Revenue Aktif</span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-slate-900">{formattedRevenue}</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center text-blue-600 mb-4">
            <Crown className="w-5 h-5 mr-2" />
            <span className="font-bold text-sm uppercase tracking-wider">Subscriber Aktif</span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-slate-900">{activeCount} <span className="text-lg text-slate-500 font-medium">Pengguna</span></p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center text-amber-600 mb-4">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="font-bold text-sm uppercase tracking-wider">Pertumbuhan</span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-slate-900">+15% <span className="text-lg text-slate-500 font-medium">Bulan ini</span></p>
        </div>
      </div>

      {/* Data Table */}
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <Users className="w-5 h-5 mr-2 text-slate-500" /> Daftar Subscriber
      </h2>
      
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-xs">
                <th className="px-6 py-4 font-bold">Penjual</th>
                <th className="px-6 py-4 font-bold">Kontak</th>
                <th className="px-6 py-4 font-bold">Paket</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Belum ada data langganan.</td>
                </tr>
              ) : (
                subs.map((sub) => {
                  const user = sub.user as { full_name: string, email: string, whatsapp_number: string } | undefined;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-bold">{user?.full_name || 'Tanpa Nama'}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{user?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {user?.whatsapp_number || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          sub.plan === 'YEARLY' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {sub.plan === 'YEARLY' ? 'Tahunan' : 'Bulanan'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max ${
                          sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${sub.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {sub.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition underline decoration-slate-300 underline-offset-4">
                          Detail
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
