# PRD – Dessa.id
## Platform Promosi Lahan Pedesaan Berbasis Geospasial & Langganan

| Field | Value |
|---|---|
| **Nama Produk** | Dessa.id |
| **Versi PRD** | v2.0 – MVP (Vercel Optimized) |
| **Author** | Mohammad Abdul Faiz · A11.2023.15305 |
| **Tanggal** | Juni 2026 |
| **Tech Stack** | Next.js 14 + Supabase + React-Leaflet + Midtrans |
| **Target Rilis MVP** | Q3 2026 |

---

## Daftar Isi

1. [Overview Produk](#1-overview-produk)
2. [Arsitektur & Tech Stack (Optimized)](#2-arsitektur--tech-stack-optimized)
3. [User Persona](#3-user-persona)
4. [User Flow Utama](#4-user-flow-utama)
5. [Fitur & Requirements](#5-fitur--requirements)
6. [Halaman & Routing](#6-halaman--routing)
7. [Desain Database & Skema](#7-desain-database--skema)
8. [API Routes & Integrasi Webhook](#8-api-routes--integrasi-webhook)
9. [Keamanan & Standar OWASP](#9-keamanan--standar-owasp)
10. [Error States & Edge Cases](#10-error-states--edge-cases)
11. [Milestone & Deployment Guide](#11-milestone--deployment-guide)

---

## 1. Overview Produk

### 1.1 Visi & Misi
Menjadi platform promosi lahan pedesaan nomor satu di Indonesia yang transparan, aman, dan berbasis data geospasial. Mendigitalisasi aset lahan desa dan menjembatani pemilik lahan dengan investor perkotaan.

### 1.2 Scope MVP & Model Bisnis
Dessa.id adalah platform **promosi & discovery**. Transaksi dan urusan notaris dilakukan di luar platform. 
Platform menggunakan model bisnis **Subscription-based** (berlangganan) untuk penjual. Penjual membayar biaya langganan via Midtrans untuk dapat menayangkan listing. Pembeli (investor) menggunakan platform secara gratis.

---

## 2. Arsitektur & Tech Stack (Optimized)

Arsitektur ini didesain khusus agar 100% kompatibel dengan **Vercel Free Tier** (mencegah *timeout* dan limitasi *serverless function*).

| Layer | Teknologi | Alasan Optimalisasi |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG untuk SEO lahan yang sangat baik. |
| **Styling** | Tailwind CSS + shadcn/ui | UI ringan, konsisten, dan minim *dependency*. |
| **Map** | **React-Leaflet** | Menggantikan Mapbox. 100% Gratis (OpenStreetMap), tanpa API Key, dan ringan di sisi *client*. |
| **Backend/DB** | Supabase (PostgreSQL) | Terintegrasi penuh untuk DB, Auth, dan Storage. |
| **Auth** | **Supabase Google OAuth / Magic Link** | Menggantikan Twilio WA OTP yang berbayar dan berat di *setup*. Lebih cepat dan konversi tinggi. |
| **Storage** | Supabase Storage | Penyimpanan foto lahan dan dokumen verifikasi. |
| **Image Process** | **HTML5 `<canvas>` (Client-Side)** | Menggantikan library Sharp di *backend*. Foto di-*resize* dan di-*watermark* di browser HP/PC user *sebelum* di-upload ke Supabase. Menghemat 100% limit Vercel. |
| **Payment** | Midtrans (Snap) | Gateway pembayaran lokal untuk langganan bulanan/tahunan. |
| **Cron Jobs** | **Supabase `pg_cron`** | Menggantikan Vercel Cron. Logika penonaktifan langganan *expired* berjalan langsung di dalam PostgreSQL. |

---

## 3. User Persona

| | **Penjual Lahan** | **Pembeli / Investor** | **Admin Dessa.id** |
|---|---|---|---|
| **Goal** | Mengiklankan lahan, membayar langganan mudah | Menemukan lahan, melihat koordinat pasti, hubungi penjual | Moderasi cepat, cek pembayaran, kelola *whitelist* |
| **Device** | Mayoritas mobile (HP Android) | Desktop & Mobile | Desktop |

---

## 4. User Flow Utama

### 4.1 Flow Penjual — Registrasi hingga Tayang
```text
[Landing Page] -> Klik "Masuk/Daftar"
      |
      v
[Auth via Google Account / Email Magic Link] -> Akun Aktif
      |
      v
[/dashboard] -> Cek Status Langganan
      |
      |-- [Langganan Tidak Aktif] -> Muncul Paywall -> Pilih Paket -> Bayar via Midtrans Snap -> Lunas
      |
      v
[Klik "Buat Listing Baru"]
      |
      v
[Step 1: Isi Form (Judul, Harga, Luas, Dokumen)]
[Step 2: Peta (React-Leaflet) -> Geser Pin ke Lokasi Lahan -> Dapat Lat/Lng]
[Step 3: Upload Foto -> Browser resize & pasang watermark otomatis via <canvas> -> Upload ke Supabase]
[Step 4: Upload Dokumen Privat (KTP/Sertifikat)]
      |
      v
[Submit] -> Status Listing: PENDING
      |
      v
[Direview Admin] -> Jika di-approve -> Status: PUBLISHED -> Lahan tampil di halaman publik.
4.2 Flow Pembeli — DiscoveryPlaintext[Landing Page] -> Klik "Jelajahi Lahan"
      |
      v
[/jelajahi] -> Map View (Leaflet) tampilkan PIN lahan PUBLISHED
      |
      v
[Filter Data] -> Berdasarkan Harga / Luas / Status Dokumen
      |
      v
[Klik Lahan] -> Buka /lahan/[id] -> Lihat Detail, Foto, Koordinat
      |
      v
[Klik "Hubungi Penjual"] -> Redirect ke wa.me/[nomor_penjual]
5. Fitur & Requirements5.1 Modul Akun & Auth (Supabase)IDFiturKriteria PenerimaanA-01Login / RegisterMenggunakan Google OAuth atau Email Link. Otomatis membuat record di tabel profiles.A-02Lengkapi ProfilSetelah login pertama kali, penjual diwajibkan mengisi Nomor WA aktif.A-03Role ManagementUser dengan role admin otomatis bisa mengakses /admin.5.2 Modul Listing Lahan & PetaIDFiturKriteria PenerimaanL-01Peta InteraktifMenggunakan React-Leaflet. Wajib di-import menggunakan next/dynamic dengan ssr: false.L-02Client-Side WatermarkScript frontend menangkap input .jpg/.png, menggambar logo dessa.id di atas <canvas>, lalu mengirim hasil akhirnya ke storage. Max ukuran file akhir 2MB.L-03Manajemen StatusListing memiliki lifecycle: draft -> pending (menunggu moderasi) -> published (tayang) -> sold / rejected.5.3 Modul Langganan & MidtransIDFiturKriteria PenerimaanP-01Paywall GuardFungsi pengecekan status langganan di Next.js middleware atau layout dashboard.P-02Midtrans SnapGenerate snap_token di backend, munculkan popup pembayaran di frontend. Mendukung QRIS, VA, dan E-Wallet.P-03Webhook HandlerEndpoint Next.js untuk menerima update status dari Midtrans secara asinkron.P-04Auto-DeactivateFungsi PostgreSQL pg_cron yang berjalan jam 00:00 setiap hari untuk mengubah status listing menjadi inactive jika langganan habis.6. Halaman & RoutingRouteTipe AksesDeskripsi/PublikLanding Page (Hero, Value Proposition, CTA)./jelajahiPublikPeta eksplorasi (Leaflet), Filter, Daftar Card Lahan./lahan/[id]PublikDetail Lahan. SSR/SSG untuk meta tags OG (bagus untuk share ke WA/FB)./dashboardAuth (Seller)Ringkasan listing, status langganan, tombol tambah listing./dashboard/langgananAuth (Seller)Halaman paywall, pilih paket (Bulan/Tahun), riwayat pembayaran./dashboard/listing/baruPaywall GuardForm multi-step pembuatan listing (hanya bisa diakses jika langganan aktif)./adminAuth (Admin)Dashboard Moderasi Antrian (Approve/Reject)./admin/revenueAuth (Admin)Laporan langganan, jumlah subscriber aktif, opsi whitelist penjual.7. Desain Database & SkemaDatabase menggunakan PostgreSQL (Supabase).Tabel: profilesKolomTipeKeteranganiduuid (FK auth.users)Primary key, referensi ke sistem Auth Supabasefull_nametextNama lengkap userwhatsapptextNomor WhatsApp aktif (format: 628xxx)roletextNilai: seller atau adminTabel: subscriptionsKolomTipeKeteranganiduuidPrimary keyseller_iduuid (FK profiles)Relasi ke penjualplantext'monthly' atau 'yearly'statustext'active', 'expired', atau 'cancelled'expired_attimestamptzTanggal berakhirnya langgananis_whitelistedbooleantrue jika admin memberikan akses gratisTabel: orders (Midtrans)KolomTipeKeteranganorder_idtextID Unik Midtrans (e.g., dessa-uuid-timestamp)seller_iduuid (FK profiles)Pembeli paketamountbigintNominal transaksi (Rupiah)statustext'pending', 'paid', 'failed', 'expired'snap_tokentextToken untuk memunculkan popup MidtransTabel: listingsKolomTipeKeteranganiduuidPrimary keyseller_iduuid (FK profiles)Pemilik listingtitletextJudul iklan lahandescriptiontextSpesifikasi lengkap lahanpricebigintHarga lahanarea_m2numericLuas lahandoc_statustextSHM, SHGB, Girik, atau AJBlatitudedouble precisionKoordinat Y (Leaflet)longitudedouble precisionKoordinat X (Leaflet)statustext'draft', 'pending', 'published', 'sold', 'inactive'8. API Routes & Integrasi WebhookMenggunakan Next.js App Router (app/api/...)EndpointMethodFungsi/api/payment/createPOSTGenerate snap_token Midtrans. Body: { plan: 'monthly'/'yearly' }./api/payment/webhookPOSTMenerima respon otomatis dari server Midtrans. Melakukan validasi SHA512(order_id + status_code + gross_amount + server_key). Jika valid, eksekusi operasi UPDATE ke tabel orders dan subscriptions.9. Keamanan & Standar OWASPPlatform ini menerapkan mitigasi ketat terhadap kerentanan aplikasi web modern, khususnya yang tercantum dalam OWASP Top 10:Pencegahan Broken Access Control (BAC):Pengecekan role tidak hanya dilakukan di frontend Next.js, melainkan dikunci kuat di tingkat database menggunakan Supabase Row Level Security (RLS).Policy listings: Penjual hanya dapat melakukan UPDATE dan DELETE pada baris di mana auth.uid() = seller_id.Policy Storage: Bucket untuk KTP/Sertifikat (private-docs) tidak memiliki akses read publik. Hanya user dengan role = 'admin' yang diizinkan mengakses URL objek tersebut.Pencegahan SQL Injection (SQLi):Tidak ada penggunaan string concatenation dalam interaksi database. Semua kueri dari Next.js ke PostgreSQL menggunakan Supabase JS Client (PostgREST) yang secara fundamental memproses data menggunakan Parameterized Queries.Pencegahan Cross-Site Scripting (XSS):Semua input text penjual (seperti title dan description) secara otomatis di-escape oleh React saat proses render di client.Penggunaan atribut dangerouslySetInnerHTML dihindari sepenuhnya.10. Error States & Edge CasesSkenarioMitigasi / UXPeta Blank atau Error SSRPustaka react-leaflet dipanggil menggunakan next/dynamic dengan opsi { ssr: false }.Midtrans Double WebhookMenerapkan Idempotency di /api/payment/webhook. Cek apakah orders.status sudah 'paid' sebelum melakukan proses penambahan hari langganan.User Tolak Akses GPSPeta Leaflet memunculkan default center (Semarang). User dapat mendrag marker secara manual ke lokasi lahannya.Ukuran Foto Terlalu BesarAlgoritma canvas client-side secara otomatis menurunkan resolusi/kualitas foto hingga berada di bawah 2MB sebelum di-POST ke Supabase.11. Milestone & Deployment GuideMilestone ImplementasiMinggu 1: Setup Next.js, Supabase Database Schema, dan RLS Policies. Integrasi Google OAuth.Minggu 2: Pembuatan komponen UI Peta interaktif dengan React-Leaflet. Fitur upload foto dengan HTML5 Canvas watermarking.Minggu 3: Integrasi Midtrans Snap & pembuatan Webhook Handler API. Pembuatan logika Paywall.Minggu 4: Pembuatan halaman Admin (Antrian & Approval). Setup pg_cron di PostgreSQL Supabase.Minggu 5: Testing end-to-end (QA), perbaikan bug, dan finalisasi deployment ke Vercel.Vercel Deployment ChecklistPastikan Environment Variables berikut disetel di Vercel Dashboard sebelum menekan Deploy:NEXT_PUBLIC_SUPABASE_URLNEXT_PUBLIC_SUPABASE_ANON_KEYNEXT_PUBLIC_MIDTRANS_CLIENT_KEYMIDTRANS_SERVER_KEY (Hanya Server-Side)

1. Design System & Tema (Vibe)
Agar tampilannya mencerminkan "Lahan Pedesaan" namun tetap dipercaya oleh "Investor Perkotaan", kita gunakan perpaduan warna bumi (Earthy Tones) dan tata letak yang bersih (Clean & Minimalist).

Primary Color: Emerald Green (emerald-600 untuk tombol, emerald-50 untuk background ringan). Melambangkan agribisnis dan lahan hijau.

Secondary Color: Charcoal/Dark Slate (slate-900 untuk teks heading, slate-500 untuk teks paragraf).

Font: Plus Jakarta Sans atau Inter (Sangat profesional dan mudah dibaca).

Komponen: Menggunakan bentuk rounded (rounded-xl atau rounded-2xl) dipadukan dengan soft shadow (shadow-sm, shadow-md) ala antarmuka modern (seperti Airbnb atau Traveloka).

2. Prompt UI (Untuk di-copy ke v0.dev / Cursor)
Jika Anda menggunakan AI builder, cukup copy-paste prompt ajaib ini:

Prompt untuk Landing Page:

"Buatkan halaman Landing Page Next.js menggunakan Tailwind CSS dan lucide-react. Tema warnanya menggunakan emerald-600 sebagai primary. Desainnya harus clean, modern, mirip Airbnb tapi untuk jual beli lahan desa. Terdiri dari: 1. Navbar dengan logo teks 'Dessa.id' dan tombol 'Masuk/Daftar'. 2. Hero section dengan background image estetik persawahan (di-overlay gelap), headline besar 'Investasi Lahan Pedesaan Kini Transparan & Aman', sub-headline, dan floating search bar untuk mencari lokasi/harga. 3. Section 'Kenapa Dessa.id' dengan 3 grid card (Geospasial Presisi, Langsung ke Penjual, Keamanan Terjamin)."

Prompt untuk Halaman Peta (Jelajahi):

"Buatkan UI Next.js untuk halaman pencarian lahan dengan layout split-screen. Sebelah kiri adalah daftar card lahan (grid 2 kolom, ada foto, harga, luas lahan, tombol detail). Sebelah kanan adalah area placeholder untuk Peta Interaktif (Leaflet) yang full height. Di atas daftar lahan ada deretan filter button (Harga, Luas, Sertifikat). Gunakan warna emerald-600 dan Tailwind CSS yang rapi."

3. Vibe Code: Halaman Utama (Landing Page)
Ini adalah kerangka kode React (Next.js) dengan Tailwind CSS untuk halaman depan (app/page.tsx). Tampilannya dijamin elegan!

TypeScript
import React from 'react';
import { MapPin, ShieldCheck, Sprout, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Sprout className="h-8 w-8 text-emerald-600 mr-2" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">Dessa.id</span>
            </div>
            <div className="flex space-x-4 items-center">
              <Link href="/jelajahi" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition">
                Jelajahi Lahan
              </Link>
              <Link href="/masuk">
                <button className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md">
                  Mulai Jual Lahan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Temukan Lahan Pedesaan <br className="hidden md:block"/>
            <span className="text-emerald-600">Terbaik untuk Investasi</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Platform geospasial pertama yang menghubungkan pemilik lahan desa langsung dengan investor perkotaan. Transparan, presisi, dan aman.
          </p>

          {/* Floating Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-full p-2 flex items-center shadow-lg border border-slate-100">
            <div className="flex-grow flex items-center pl-4">
              <MapPin className="h-5 w-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Cari lokasi (misal: Gunungpati, Mijen...)" 
                className="w-full focus:outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            <button className="bg-emerald-600 text-white p-3 md:px-8 rounded-full font-medium hover:bg-emerald-700 transition flex items-center">
              <Search className="h-5 w-5 md:mr-2" />
              <span className="hidden md:block">Cari Lahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fitur / Value Proposition */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Kenapa Memilih Dessa.id?</h2>
            <p className="mt-4 text-slate-600">Solusi digital untuk masalah jual-beli lahan tradisional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geospasial Presisi</h3>
              <p className="text-slate-600 leading-relaxed">
                Tidak ada lagi "lokasi buta". Setiap listing dilengkapi koordinat satelit akurat agar Anda bisa mensurvei titik secara langsung.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verifikasi Admin</h3>
              <p className="text-slate-600 leading-relaxed">
                Kami memastikan setiap penjual mengunggah identitas dan bukti kepemilikan surat sebelum lahan tayang di platform.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Sprout className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Langsung ke Penjual</h3>
              <p className="text-slate-600 leading-relaxed">
                Tanpa perantara yang menggelembungkan harga. Hubungi pemilik lahan langsung melalui WhatsApp dengan satu klik.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Punya Lahan Terbengkalai di Desa?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Ubah aset Anda menjadi portofolio yang dilihat oleh ribuan calon pembeli potensial dari kota. Daftar sekarang, dapatkan akses gratis 7 hari!
          </p>
          <button className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition shadow-lg flex items-center mx-auto">
            Pasang Iklan Lahan <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}