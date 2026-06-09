-- =====================================================
-- DESSA.ID - MASTER FIX (Jalankan ini di SQL Editor)
-- File ini memperbaiki SEMUA masalah database sekaligus
-- =====================================================

-- =====================
-- STEP 1: TRIGGER (Penyalinan otomatis auth -> public.users)
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, whatsapp_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '-'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller')::public.user_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================
-- STEP 2: Salin paksa semua akun lama yang belum masuk ke tabel users
-- =====================
INSERT INTO public.users (id, full_name, whatsapp_number, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  COALESCE(raw_user_meta_data->>'whatsapp_number', '-'),
  COALESCE(raw_user_meta_data->>'role', 'seller')::public.user_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- =====================
-- STEP 3: FIX RLS - USERS TABLE
-- =====================
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Allow trigger insert for new users" ON users;

CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Allow trigger insert for new users" ON users
  FOR INSERT WITH CHECK (true);

-- =====================
-- STEP 4: FIX RLS - LISTINGS TABLE
-- =====================
DROP POLICY IF EXISTS "Admin can view all listings" ON listings;
DROP POLICY IF EXISTS "Admin can update any listing" ON listings;

CREATE POLICY "Admin can view all listings" ON listings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can update any listing" ON listings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- =====================
-- STEP 5: FIX STORAGE POLICIES
-- =====================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lahan-photos', 'lahan-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view lahan photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lahan-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view lahan photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lahan-photos');

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lahan-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================
-- STEP 6: Jadikan akun pertama sebagai Admin
-- =====================
UPDATE public.users SET role = 'admin' 
WHERE id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1);
