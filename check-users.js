const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

async function checkUsers() {
  console.log("Mencari user terbaru...");
  // Note: We might be blocked by RLS if we just do select().
  // Let's see if we can read users.
  const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5);
  
  if (error) {
    console.error("Gagal membaca users:", error.message);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log("Tidak ada user ditemukan. Mungkin RLS memblokir?");
  } else {
    console.log("\n5 User Terbaru di tabel public.users:");
    users.forEach(u => {
      console.log(`- ${u.email || 'NO_EMAIL'} | Role: ${u.role} | Nama: ${u.full_name} | ID: ${u.id}`);
    });
  }
}

checkUsers();
