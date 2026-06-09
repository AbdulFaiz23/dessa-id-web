import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditListingForm from './EditListingForm';

export default async function AdminEditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const listingId = params.id;
  
  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Fetch listing data
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (error || !listing) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Lahan tidak ditemukan</h2>
        <Link href="/admin/listings" className="text-blue-600 hover:underline mt-4 inline-block">Kembali ke Manajemen Lahan</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <Link href="/admin/listings" className="flex items-center text-slate-500 hover:text-emerald-600 text-sm font-bold mb-6 transition w-max">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Manajemen Lahan
      </Link>
      
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Edit Lahan</h1>
        <p className="text-slate-500 font-medium">Ubah detail data lahan dengan ID: <span className="font-mono text-xs">{listingId}</span></p>
      </div>

      <EditListingForm listing={listing} />
    </div>
  );
}
