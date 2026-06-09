import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function NewListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/masuk');
  }

  // Cek apakah user memiliki langganan aktif
  const { data: activeSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'ACTIVE')
    .gt('valid_until', new Date().toISOString())
    .limit(1)
    .single();

  // Jika tidak punya langganan aktif, paksa kembali ke halaman langganan
  if (!activeSub) {
    // Karena next/navigation redirect di server side melempar error khusus,
    // pesan error mungkin lebih baik disampaikan via query parameter
    redirect('/dashboard/langganan?message=Mohon berlangganan paket terlebih dahulu untuk mempublikasikan lahan baru.');
  }

  return <>{children}</>;
}
