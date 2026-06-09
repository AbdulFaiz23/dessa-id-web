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

async function checkSub() {
  const { data: user } = await supabase.from('users').select('*').limit(1);
  if (!user || user.length === 0) return;
  const { error } = await supabase.from('subscriptions').insert({
        seller_id: user[0].id,
        plan: 'MONTHLY',
        status: 'ACTIVE',
        valid_until: new Date().toISOString()
  });
  console.log('Insert Error:', error);
}

checkSub();
