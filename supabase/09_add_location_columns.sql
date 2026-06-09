-- 1. Tambahkan kolom city dan address ke tabel listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Update existing dummy data with some cities so they don't break the UI
-- Specific ID updates removed because listings use UUIDs, not string IDs.

-- For any other listings, just set a default or leave null, but let's default to something safe
UPDATE public.listings SET city = 'Kota Semarang' WHERE city IS NULL;
