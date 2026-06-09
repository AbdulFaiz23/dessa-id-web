import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Setup Supabase Admin Client to bypass RLS for webhook operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    
    // 1. Verify Midtrans Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hashData = payload.order_id + payload.status_code + payload.gross_amount + serverKey;
    const signatureKey = crypto.createHash('sha512').update(hashData).digest('hex');
    
    if (signatureKey !== payload.signature_key) {
      console.error('Invalid Midtrans Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const { order_id, transaction_status, fraud_status } = payload;
    
    // 2. Fetch the corresponding order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', order_id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Determine transaction logic
    let newStatus = 'pending';
    if (transaction_status == 'capture') {
        if (fraud_status == 'challenge'){
            newStatus = 'pending'; // Requires manual intervention in midtrans dashboard
        } else if (fraud_status == 'accept'){
            newStatus = 'paid';
        }
    } else if (transaction_status == 'settlement'){
        newStatus = 'paid';
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire'){
        newStatus = 'failed';
    } else if (transaction_status == 'pending'){
        newStatus = 'pending';
    }

    // 4. Update the order status
    await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('order_id', order_id);

    // 5. If paid, activate/extend subscription
    if (newStatus === 'paid') {
      const planDurationDays = order.plan === 'yearly' ? 365 : 30;
      
      // Check if user already has an active subscription
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('seller_id', order.seller_id)
        .order('valid_until', { ascending: false })
        .limit(1)
        .single();

      let newValidUntil = new Date();
      if (existingSub && new Date(existingSub.valid_until) > new Date()) {
        // Extend existing active subscription
        newValidUntil = new Date(existingSub.valid_until);
        newValidUntil.setDate(newValidUntil.getDate() + planDurationDays);
      } else {
        // Start fresh
        newValidUntil.setDate(newValidUntil.getDate() + planDurationDays);
      }

      await supabaseAdmin
        .from('subscriptions')
        .insert({
          seller_id: order.seller_id,
          plan: order.plan === 'yearly' ? 'YEARLY' : 'MONTHLY',
          status: 'ACTIVE',
          valid_until: newValidUntil.toISOString()
        });
    }

    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
