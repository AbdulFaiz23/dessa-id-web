'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateListingStatus(formData: FormData) {
  const supabase = createClient()
  
  const listingId = formData.get('id') as string
  const actionType = formData.get('action') as string // 'approve' or 'reject'
  const newStatus = actionType === 'approve' ? 'PUBLISHED' : 'REJECTED'

  // Pastikan user adalah admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') {
    return { error: 'Forbidden: Admin only' }
  }

  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', listingId)

  if (error) {
    console.error('Error updating status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/listings')
  revalidatePath('/jelajahi')
}

export async function deleteListing(formData: FormData) {
  const supabase = createClient()
  
  const listingId = formData.get('id') as string

  // Pastikan user adalah admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') {
    return { error: 'Forbidden: Admin only' }
  }

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)

  if (error) {
    console.error('Error deleting listing:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/listings')
  revalidatePath('/jelajahi')
}

export async function editListingAdmin(formData: FormData) {
  const supabase = createClient()
  
  // 1. Get user session & verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') {
    return { error: 'Forbidden: Admin only' }
  }

  // 2. Extract Data
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const price = Number(formData.get('price'))
  const area_sqm = Number(formData.get('area_sqm'))
  const document_type = formData.get('document_type') as string
  const description = formData.get('description') as string
  const lat = Number(formData.get('lat'))
  const lng = Number(formData.get('lng'))
  const city = formData.get('city') as string
  const address = formData.get('address') as string
  
  // Get current photos
  const { data: currentListing } = await supabase.from('listings').select('photos').eq('id', id).single()
  let photos: string[] = currentListing?.photos || []

  // 3. Handle File Upload if provided
  const file = formData.get('photo') as File
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `admin_edit_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `admin/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('lahan-photos')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'Gagal mengunggah foto: ' + uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lahan-photos')
      .getPublicUrl(filePath)
      
    // Replace the first photo
    photos = [publicUrl]
  }

  // 4. Update into database
  const updateData = {
    title,
    price,
    area_sqm,
    document: document_type,
    description,
    lat,
    lng,
    city,
    address,
    photos
  }

  const { error: dbError } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id)

  if (dbError) {
    console.error('DB Error:', dbError)
    return { error: 'Gagal menyimpan data: ' + dbError.message }
  }

  // 5. Success
  revalidatePath('/admin')
  revalidatePath('/admin/listings')
  revalidatePath('/jelajahi')
  
  return { success: true }
}
