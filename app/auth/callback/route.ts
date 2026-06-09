import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Determine redirect based on role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        
        if (userData?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', requestUrl.origin))
        } else if (userData?.role === 'seller') {
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
        } else {
          return NextResponse.redirect(new URL('/jelajahi', requestUrl.origin))
        }
      }
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/masuk?message=Login Gagal. Silakan coba lagi.', requestUrl.origin))
}
