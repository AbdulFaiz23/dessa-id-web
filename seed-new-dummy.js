const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 1. Load env
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

const dummyData = [
  {
    email: 'budi.santoso@dessa.id',
    password: 'password123',
    fullName: 'Budi Santoso',
    whatsapp: '081122334455',
    listings: [
      {
        title: 'Lahan Sawah Produktif View Gunung Salak',
        description: 'Sawah luas dengan pengairan yang baik dan pemandangan Gunung Salak yang indah. Cocok untuk pertanian padi dan agrowisata. Tanah gembur dan siap tanam.',
        price: 1200000000,
        area_sqm: 10000,
        city: 'Kabupaten Bogor',
        address: 'Caringin, Bogor, Jawa Barat',
        lat: -6.7027,
        lng: 106.8486,
        document: 'SHM',
        photos: ['https://images.unsplash.com/photo-1590403328564-9134b2106e23?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  },
  {
    email: 'asep.suryana@dessa.id',
    password: 'password123',
    fullName: 'Asep Suryana',
    whatsapp: '085566778899',
    listings: [
      {
        title: 'Kebun Sayuran Hijau Subur Lembang',
        description: 'Lahan perkebunan sayur yang sedang aktif ditanami berbagai sayuran daun (kangkung, bayam, sawi). Tanah sangat subur, suhu sejuk, dan panen sangat cepat.',
        price: 850000000,
        area_sqm: 2500,
        city: 'Kabupaten Bandung Barat',
        address: 'Lembang, Bandung Barat, Jawa Barat',
        lat: -6.8148,
        lng: 107.6186,
        document: 'AJB',
        photos: ['https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  },
  {
    email: 'maria.lestari@dessa.id',
    password: 'password123',
    fullName: 'Maria Lestari',
    whatsapp: '087788990011',
    listings: [
      {
        title: 'Lahan Kebun Kayu Jati dan Sengon',
        description: 'Lahan luas berupa hutan tanaman industri (Jati dan Sengon). Investasi kayu jangka panjang yang sangat menguntungkan. Terdapat area kosong di tengah yang bisa dibangun villa atau gudang panen.',
        price: 3000000000,
        area_sqm: 50000,
        city: 'Kabupaten Wonogiri',
        address: 'Girimarto, Wonogiri, Jawa Tengah',
        lat: -7.8687,
        lng: 111.0371,
        document: 'SHM',
        photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  },
  {
    email: 'ujang.koswara@dessa.id',
    password: 'password123',
    fullName: 'Ujang Koswara',
    whatsapp: '089900112233',
    listings: [
      {
        title: 'Lahan Pertanian Kering / Palawija Indramayu',
        description: 'Lahan yang sangat cocok untuk ditanami palawija (jagung, kedelai) saat musim kemarau. Harga miring butuh uang cepat. Tanah subur jika dikelola dengan baik saat musim penghujan.',
        price: 450000000,
        area_sqm: 15000,
        city: 'Kabupaten Indramayu',
        address: 'Kroya, Indramayu, Jawa Barat',
        lat: -6.4862,
        lng: 108.0664,
        document: 'Girik',
        photos: ['https://images.unsplash.com/photo-1599813352774-725b8ff3fb88?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  },
  {
    email: 'wayan.dipta@dessa.id',
    password: 'password123',
    fullName: 'Wayan Dipta',
    whatsapp: '081223344556',
    listings: [
      {
        title: 'Terasering Sawah Indah Tegalalang',
        description: 'Lahan sawah terasering dengan pemandangan sunrise dan siluet gunung yang luar biasa. Berada di kawasan wisata yang sedang berkembang. Potensi sangat besar untuk dibangun resort eksklusif atau villa glamping.',
        price: 5000000000,
        area_sqm: 8000,
        city: 'Kabupaten Gianyar',
        address: 'Tegalalang, Gianyar, Bali',
        lat: -8.4323,
        lng: 115.2789,
        document: 'SHM',
        photos: ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  }
];

async function seed() {
  console.log('Memulai proses seeding data dummy 5 gambar...');

  for (const user of dummyData) {
    console.log(`\nMendaftarkan user: ${user.email}`);
    
    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`User ${user.email} sudah terdaftar, mencoba sign in...`);
        await supabase.auth.signInWithPassword({ email: user.email, password: user.password });
      } else {
        console.error('Gagal Sign Up:', authError.message);
        continue;
      }
    } else {
      console.log('Berhasil Sign Up.');
    }

    // Ambil session saat ini
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Session tidak valid');
      continue;
    }
    const userId = session.user.id;

    // 2. Update Profile di public.users
    console.log(`Mengupdate profile untuk ${user.fullName}`);
    await supabase.from('users').upsert({
      id: userId,
      email: user.email,
      full_name: user.fullName,
      whatsapp_number: user.whatsapp,
      role: 'seller'
    });

    // 3. Masukkan Langganan Dummy (agar tidak diblokir jika user login)
    await supabase.from('subscriptions').insert({
      seller_id: userId,
      plan: 'YEARLY',
      status: 'ACTIVE',
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // + 1 tahun
    });

    // 4. Masukkan Listings
    console.log(`Menambahkan ${user.listings.length} listing...`);
    for (const listing of user.listings) {
      const { error: listingError } = await supabase.from('listings').insert({
        seller_id: userId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        area_sqm: listing.area_sqm,
        city: listing.city,
        address: listing.address,
        lat: listing.lat,
        lng: listing.lng,
        document: listing.document,
        photos: listing.photos,
        status: listing.status
      });

      if (listingError) {
        console.error('Gagal insert listing:', listing.title, listingError.message);
      } else {
        console.log(`  -> Berhasil: ${listing.title}`);
      }
    }
    
    // Logout untuk user selanjutnya
    await supabase.auth.signOut();
  }

  console.log('\n✅ Proses seeding 5 dummy data Selesai!');
}

seed();
