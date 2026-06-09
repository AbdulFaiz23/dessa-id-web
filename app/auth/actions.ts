'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/masuk?message=' + encodeURIComponent('Login gagal: ' + error.message))
  }

  // Check user role to redirect to the correct page
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    
    revalidatePath('/', 'layout')
    
    if (userData?.role === 'admin') {
      redirect('/admin')
    } else if (userData?.role === 'investor') {
      redirect('/jelajahi')
    } else {
      redirect('/dashboard')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const whatsapp_number = formData.get('whatsapp_number') as string
  const role = formData.get('role') as string || 'investor'

  // SignUp user in Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        whatsapp_number,
        role
      }
    }
  })

  if (error) {
    redirect('/daftar?message=' + encodeURIComponent('Pendaftaran gagal: ' + error.message))
  }
  
  // Note: Data is saved to auth.users.raw_user_meta_data.
  // We rely on a Postgres Trigger to automatically copy this data to public.users table.

  revalidatePath('/', 'layout')
  redirect('/masuk?message=' + encodeURIComponent('Pendaftaran berhasil! Silakan login.'))
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/masuk')
}
