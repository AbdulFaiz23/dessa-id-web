import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import midtransClient from 'midtrans-client';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    
    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Fetch user details for customer info
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, email, whatsapp_number')
      .eq('id', user.id)
      .single();

    const amount = plan === 'yearly' ? 450000 : 49000;
    const orderId = `DESSA-${user.id.slice(0,8)}-${Date.now()}`;

    // DEMO MODE: Bypassing Midtrans completely
    // Create Snap API instance (Commented out for demo)
    /*
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    });
    */

    // Simulate Token Generation
    const token = `DEMO_SUCCESS_TOKEN_${Date.now()}`;

    // DEMO: Auto insert order as 'paid' directly
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        seller_id: user.id,
        plan: plan,
        amount: amount,
        status: 'paid', // Langsung lunas untuk keperluan demo
        snap_token: token
      });

    if (dbError) {
      console.error('Failed to save order:', dbError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // DEMO: Automatically activate subscription
    const planDurationDays = plan === 'yearly' ? 365 : 30;
      
    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('seller_id', user.id)
      .order('valid_until', { ascending: false })
      .limit(1)
      .single();

    let newValidUntil = new Date();
    if (existingSub && new Date(existingSub.valid_until) > new Date()) {
      newValidUntil = new Date(existingSub.valid_until);
      newValidUntil.setDate(newValidUntil.getDate() + planDurationDays);
    } else {
      newValidUntil.setDate(newValidUntil.getDate() + planDurationDays);
    }

    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        seller_id: user.id,
        plan: plan === 'yearly' ? 'YEARLY' : 'MONTHLY',
        status: 'ACTIVE',
        valid_until: newValidUntil.toISOString()
      });

    if (subError) {
      console.error('Failed to save subscription:', subError);
      return NextResponse.json({ error: 'Berhasil bayar, tapi gagal mengaktifkan langganan (Cek SQL RLS)' }, { status: 500 });
    }

    return NextResponse.json({ 
      token,
      order_id: orderId,
      amount
    });

  } catch (error: any) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
