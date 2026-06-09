-- 1. Buat fungsi bantuan untuk mengecek Admin secara aman (Bypass RLS untuk mencegah Infinite Recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Hapus semua policy di tabel users yang berpotensi rekursif (Infinite Recursion)
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can view all listings" ON public.listings;
DROP POLICY IF EXISTS "Admin can update any listing" ON public.listings;

-- 3. Buat ulang policy dengan fungsi is_admin() yang aman
CREATE POLICY "Admin can view all users" ON public.users
  FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Admin can view all listings" ON public.listings
  FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Admin can update any listing" ON public.listings
  FOR UPDATE USING ( public.is_admin() );

-- 4. Perbaiki Trigger Pendaftaran (Pastikan email masuk dan tidak error)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, whatsapp_number, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '-'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'investor'::public.user_role),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
