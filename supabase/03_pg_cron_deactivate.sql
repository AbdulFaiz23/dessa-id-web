-- 1. Aktifkan Ekstensi pg_cron (Hanya bisa dijalankan jika PostgreSQL mendukung)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Buat Fungsi untuk Menonaktifkan Langganan & Listing
CREATE OR REPLACE FUNCTION public.deactivate_expired_subscriptions()
RETURNS void AS $$
DECLARE
  expired_seller_ids UUID[];
BEGIN
  -- A. Cari dan update subscriptions yang sudah lewat waktu valid_until dan masih ACTIVE
  -- Kumpulkan id penjualnya ke dalam array expired_seller_ids
  WITH updated_subs AS (
    UPDATE public.subscriptions
    SET status = 'EXPIRED'
    WHERE status = 'ACTIVE' AND valid_until < NOW()
    RETURNING seller_id
  )
  SELECT array_agg(DISTINCT seller_id) INTO expired_seller_ids
  FROM updated_subs;

  -- B. Jika ada penjual yang langganannya baru saja kadaluarsa, nonaktifkan listing mereka
  IF array_length(expired_seller_ids, 1) > 0 THEN
    UPDATE public.listings
    SET status = 'DRAFT' -- Mengubah dari PUBLISHED menjadi DRAFT agar tidak tayang publik
    WHERE seller_id = ANY(expired_seller_ids)
      AND status = 'PUBLISHED';
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Jadwalkan cron job agar berjalan setiap hari pada pukul 00:00 (Tengah Malam)
-- Jika jadwal dengan nama yang sama sudah ada, pg_cron akan otomatis mengupdatenya.
-- 4. Jadwalkan cron job agar berjalan setiap hari pada pukul 00:00 (Tengah Malam)
SELECT cron.schedule(
  'daily_deactivate_expired_subscriptions', -- Nama Job
  '0 0 * * *',                             -- Jadwal Cron (Setiap jam 00:00)
  $$ SELECT public.deactivate_expired_subscriptions(); $$
);
