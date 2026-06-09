import React from 'react';
import { Check, X, Eye, Map, MapPin, Maximize, FileText, Trash2, ShieldAlert, Edit } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { updateListingStatus, deleteListing } from '@/app/admin/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ConfirmSubmitButton from './ConfirmSubmitButton';

export default async function AdminListingsPage() {
  const supabase = createClient();
  
  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Fetch ALL listings with seller details
  const { data: allListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users(full_name, whatsapp_number, email)
    `)
    .order('created_at', { ascending: false });

  const listings = allListings || [];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Premium Header */}
      <div className="relative mb-10 p-8 rounded-[2rem] bg-white border border-slate-200 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold mb-4">
              <Map className="w-3.5 h-3.5 mr-1.5" /> Database Lahan
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Manajemen Lahan</h1>
            <p className="text-slate-500 font-medium max-w-xl">Pantau, perbarui status, atau hapus semua data lahan penjual dengan kendali penuh.</p>
          </div>
          <div className="bg-slate-50/50 backdrop-blur-md border border-slate-200/80 px-5 py-3 rounded-2xl flex items-center shadow-inner">
            <span className="text-emerald-600 font-extrabold text-2xl mr-3">{listings.length}</span>
            <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider leading-tight">Total<br/>Lahan</span>
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] p-16 md:p-24 text-center animate-fade-in relative overflow-hidden shadow-xl">
           <p className="text-slate-500 text-lg">Belum ada lahan yang didaftarkan.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-bold">Lahan</th>
                  <th className="px-6 py-4 font-bold">Penjual</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Aksi (Ubah Status)</th>
                  <th className="px-6 py-4 font-bold text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((lahan) => {
                  const seller = lahan.seller as { full_name: string, email: string } | undefined;
                  const imageUrl = lahan.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop';
                  
                  let statusBadge;
                  if (lahan.status === 'PUBLISHED') {
                    statusBadge = <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">Tayang</span>;
                  } else if (lahan.status === 'PENDING_REVIEW') {
                    statusBadge = <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">Antrian</span>;
                  } else {
                    statusBadge = <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">Ditolak</span>;
                  }

                  return (
                    <tr key={lahan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={imageUrl} alt={lahan.title} className="w-12 h-12 rounded-lg object-cover mr-4" />
                          <div>
                            <p className="text-slate-900 font-bold line-clamp-1 max-w-[200px]">{lahan.title}</p>
                            {(lahan.address || lahan.city) && (
                              <p className="text-slate-500 text-xs mt-1 max-w-[200px] truncate flex items-center" title={[lahan.address, lahan.city].filter(Boolean).join(', ')}>
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                {[lahan.address, lahan.city].filter(Boolean).join(', ')}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Link href={`/lahan/${lahan.id}`} target="_blank" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold uppercase flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 transition-colors w-max">
                                <Eye className="w-3 h-3 mr-1" /> Lihat
                              </Link>
                              <Link href={`/admin/listings/${lahan.id}/edit`} className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-[10px] font-bold uppercase flex items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-200 transition-colors w-max">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-bold">{seller?.full_name || 'Tanpa Nama'}</p>
                        <p className="text-slate-500 text-[10px]">{seller?.email || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {lahan.status !== 'PUBLISHED' && (
                            <form action={async (formData) => {
                              'use server'; await updateListingStatus(formData);
                            }}>
                              <input type="hidden" name="id" value={lahan.id} />
                              <input type="hidden" name="action" value="approve" />
                              <ConfirmSubmitButton 
                                title="Tayangkan" 
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition border border-emerald-200 inline-flex" 
                                confirmMessage="Yakin ingin menayangkan lahan ini?"
                              >
                                <Check className="w-4 h-4" />
                              </ConfirmSubmitButton>
                            </form>
                          )}
                          {lahan.status !== 'REJECTED' && (
                            <form action={async (formData) => {
                              'use server'; await updateListingStatus(formData);
                            }}>
                              <input type="hidden" name="id" value={lahan.id} />
                              <input type="hidden" name="action" value="reject" />
                              <ConfirmSubmitButton 
                                title="Tolak / Turunkan" 
                                className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition border border-amber-200 inline-flex" 
                                confirmMessage="Yakin ingin membatalkan penayangan lahan ini?"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </ConfirmSubmitButton>
                            </form>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <form action={async (formData) => {
                          'use server'; await deleteListing(formData);
                        }}>
                          <input type="hidden" name="id" value={lahan.id} />
                          <ConfirmSubmitButton 
                            title="Hapus Permanen" 
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition border border-red-200 inline-flex" 
                            confirmMessage="Yakin ingin menghapus lahan ini permanen? Tindakan ini tidak bisa dibatalkan."
                          >
                            <Trash2 className="w-4 h-4" />
                          </ConfirmSubmitButton>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
