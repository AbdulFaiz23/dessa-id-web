-- Izinkan Admin melihat semua langganan
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() AND public.users.role = 'admin'
  )
);

-- Izinkan Admin melihat, memperbarui, dan menghapus semua lahan (CRUD Lahan)
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
CREATE POLICY "Admins can manage all listings" 
ON public.listings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() AND public.users.role = 'admin'
  )
);

-- Izinkan Admin melihat semua pengguna (Untuk relasi data lahan/langganan)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users AS u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);
