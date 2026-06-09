const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSignup() {
  const email = `test-${Date.now()}@example.com`;
  console.log('Trying to sign up:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test User',
        whatsapp_number: '081234567890',
        role: 'seller'
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
  } else {
    console.log('Signup success:', data.user?.id);
  }
}

testSignup();
