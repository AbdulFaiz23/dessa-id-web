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
    email: 'haji.ridwan@dessa.id',
    password: 'password123',
    fullName: 'Haji Ridwan Kamil',
    whatsapp: '081234567890',
    listings: [
      {
        title: 'Tanah Sawah Produktif 2 Hektar Pinggir Jalan Raya Tegal',
        description: 'Dijual cepat tanah sawah sangat produktif di pinggir jalan raya provinsi. Panen padi 3 kali setahun berkat sistem irigasi teknis yang mengalir sepanjang tahun. Lokasi sangat strategis, truk engkel bisa masuk langsung ke bibir sawah. Sangat cocok untuk investasi jangka panjang, gudang pertanian, atau dibangun perumahan subsidi di masa depan.',
        price: 850000000,
        area_sqm: 20000,
        lat: -6.8797,
        lng: 109.1256,
        document: 'SHM',
        photos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      },
      {
        title: 'Lahan Kebun Kopi Arabika Premium di Kintamani Bali',
        description: 'Peluang langka! Lahan kebun kopi Arabika seluas 5.000 m2 di kawasan dataran tinggi Kintamani, Bali. Saat ini dikelola oleh petani lokal dengan hasil panen grade A yang rutin diekspor. Memiliki pemandangan Gunung Batur yang menakjubkan. Lahan ini juga sangat potensial untuk dikembangkan menjadi kawasan Agro-wisata atau Glamping Mewah (Glance Camping).',
        price: 1500000000,
        area_sqm: 5000,
        lat: -8.2400,
        lng: 115.3242,
        document: 'SHM',
        photos: ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  },
  {
    email: 'ibu.siti@dessa.id',
    password: 'password123',
    fullName: 'Siti Aminah',
    whatsapp: '085311223344',
    listings: [
      {
        title: 'Kavling Villa Eksklusif View Pegunungan Puncak Bogor',
        description: 'Kavling siap bangun di kawasan sejuk Puncak, Bogor. Berada di dalam klaster villa eksklusif yang sudah memiliki jalan aspal mulus, tiang listrik, dan sumber air pegunungan yang jernih. Luas tanah 800 meter persegi dengan kontur tanah datar dan terasering alami. Cocok untuk dibangun villa peristirahatan keluarga atau disewakan (Airbnb). Lingkungan aman 24 jam.',
        price: 1200000000,
        area_sqm: 800,
        lat: -6.6993,
        lng: 106.9892,
        document: 'SHGB',
        photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      },
      {
        title: 'Tanah Kosong Padang Rumput Luas di Sumba Timur',
        description: 'Dijual tanah padang rumput sabana khas Sumba Timur seluas 5 Hektar. Pemandangan perbukitan hijau (saat musim hujan) dan estetika savana eksotis (saat musim kemarau). Dekat dengan pantai Walakiri. Sangat cocok untuk investor yang ingin membangun resort alam berkonsep eco-tourism, peternakan kuda, atau sekadar land banking jangka panjang di daerah pariwisata yang sedang naik daun.',
        price: 2500000000,
        area_sqm: 50000,
        lat: -9.6586,
        lng: 120.2635,
        document: 'SHM',
        photos: ['https://images.unsplash.com/photo-1549480665-9856cc4b4334?q=80&w=1200&auto=format&fit=crop'],
        status: 'PUBLISHED'
      }
    ]
  }
];

async function seed() {
  console.log('Memulai proses seeding data dummy...');

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

  console.log('\n✅ Proses seeding Selesai!');
}

seed();
