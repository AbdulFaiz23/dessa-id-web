-- 1. Tambahkan kolom email ke tabel users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Buat Fungsi dan Trigger untuk sinkronisasi otomatis dari auth.users ke public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role, full_name, whatsapp_number, email)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'investor'::user_role),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Tanpa Nama'),
    new.raw_user_meta_data->>'whatsapp_number',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger jika sudah ada sebelumnya agar tidak bentrok
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Pasang Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tambahkan Storage Policies untuk lahan-photos
-- Hapus policy yang mungkin sudah ada agar tidak bentrok
DROP POLICY IF EXISTS "Anyone can view lahan photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload lahan photos" ON storage.objects;

-- Izinkan siapapun melihat foto lahan
CREATE POLICY "Anyone can view lahan photos" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'lahan-photos' );

-- Izinkan pengguna terautentikasi (login) mengunggah foto
CREATE POLICY "Authenticated users can upload lahan photos" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK ( bucket_id = 'lahan-photos' );
