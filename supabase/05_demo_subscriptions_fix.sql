-- Izinkan pengguna memasukkan langganan mereka sendiri
DROP POLICY IF EXISTS "Sellers can insert their own subscriptions" ON public.subscriptions;
CREATE POLICY "Sellers can insert their own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Izinkan pengguna memperbarui langganan mereka sendiri (untuk perpanjangan)
DROP POLICY IF EXISTS "Sellers can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Sellers can update their own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = seller_id);
