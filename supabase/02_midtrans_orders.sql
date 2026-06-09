-- 1. Buat Tabel orders untuk Riwayat Transaksi Midtrans
CREATE TABLE IF NOT EXISTS public.orders (
    order_id TEXT PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL, -- 'monthly' atau 'yearly'
    amount BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'expired'
    snap_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan RLS untuk orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Izinkan seller membaca orders miliknya sendiri
DROP POLICY IF EXISTS "Sellers can view their own orders" ON public.orders;
CREATE POLICY "Sellers can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = seller_id);

-- 4. Izinkan seller melakukan insert order (saat create snap token)
DROP POLICY IF EXISTS "Sellers can insert orders" ON public.orders;
CREATE POLICY "Sellers can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Catatan: Update (seperti saat sukses bayar) akan dilakukan melalui Service Role Key di Webhook
-- Sehingga kita tidak membuat Policy UPDATE untuk user biasa.
