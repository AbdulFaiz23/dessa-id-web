import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditListingForm from './EditListingForm';

export default async function SellerEditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const listingId = params.id;
  
  // Verify User Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  // Fetch listing data & verify ownership
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (error || !listing) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-red-600">Lahan tidak ditemukan</h2>
        <Link href="/dashboard" className="text-emerald-600 hover:underline mt-4 inline-block font-bold">Kembali ke Dashboard</Link>
      </div>
    );
  }

  // Security Check: Only the owner can edit
  if (listing.seller_id !== user.id) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-red-600">Akses Ditolak</h2>
        <p className="text-slate-500 mt-2">Anda tidak memiliki izin untuk mengedit lahan ini.</p>
        <Link href="/dashboard" className="text-emerald-600 hover:underline mt-4 inline-block font-bold">Kembali ke Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-emerald-600 text-sm font-bold mb-6 transition w-max">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Dashboard
      </Link>
      
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Edit Lahan</h1>
        <p className="text-slate-500 font-medium">Ubah detail data lahan Anda. Setelah disimpan, lahan akan masuk kembali ke antrean review Admin.</p>
      </div>

      <EditListingForm listing={listing} />
    </div>
  );
}
