-- 1. Hapus policy penyebab Infinite Recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;

-- 2. Buat Fungsi Pengecekan Admin yang Aman (Bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT role = 'admin' INTO admin_status FROM public.users WHERE id = auth.uid();
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Pasang ulang Policy menggunakan Fungsi Aman tersebut
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING ( public.is_admin() );

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING ( public.is_admin() );

CREATE POLICY "Admins can manage all listings" 
ON public.listings FOR ALL 
USING ( public.is_admin() );

-- 4. OTOMATISKAN AKUN ANDA MENJADI ADMIN
-- Ganti email ini dengan email yang Anda gunakan login
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'email_anda@gmail.com';
