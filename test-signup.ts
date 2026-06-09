import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Or Anon Key if service role not available
)

async function testSignup() {
  const email = `test-${Date.now()}@example.com`
  console.log('Trying to sign up:', email)
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
  })

  if (error) {
    console.error('Signup error:', error)
  } else {
    console.log('Signup success:', data.user?.id)
  }
}

testSignup()
