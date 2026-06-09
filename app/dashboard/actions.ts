'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createListing(formData: FormData) {
  const supabase = createClient()
  
  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/masuk?message=' + encodeURIComponent('Silakan login terlebih dahulu.'))
  }

  // 2. Extract Data
  const title = formData.get('title') as string
  const price = Number(formData.get('price'))
  const area_sqm = Number(formData.get('area_sqm'))
  const document_type = formData.get('document_type') as string
  const description = formData.get('description') as string
  const lat = Number(formData.get('lat'))
  const lng = Number(formData.get('lng'))
  const city = formData.get('city') as string
  const address = formData.get('address') as string
  
  // 3. Handle File Upload
  const file = formData.get('photo') as File
  const photos: string[] = []

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('lahan-photos')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'Gagal mengunggah foto: ' + uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lahan-photos')
      .getPublicUrl(filePath)
      
    photos.push(publicUrl)
  }

  // 4. Insert into database
  const insertData = {
    seller_id: user.id,
    title,
    price,
    area_sqm,
    document: document_type,
    description,
    lat,
    lng,
    city,
    address,
    photos,
    status: 'PENDING_REVIEW'
  }

  console.log('Inserting listing:', JSON.stringify(insertData, null, 2))

  const { error: dbError, data: insertedData } = await supabase
    .from('listings')
    .insert(insertData)
    .select()

  if (dbError) {
    console.error('DB Error:', dbError)
    return { error: 'Gagal menyimpan data: ' + dbError.message }
  }

  console.log('Listing created successfully:', insertedData)

  // 5. Success
  revalidatePath('/dashboard')
  redirect('/dashboard?message=' + encodeURIComponent('Listing berhasil dibuat! Menunggu review Admin.'))
}

export async function editListingSeller(formData: FormData) {
  const supabase = createClient()
  
  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

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
  
  // Get current listing to verify ownership
  const { data: currentListing } = await supabase.from('listings').select('seller_id, photos').eq('id', id).single()
  if (!currentListing) return { error: 'Lahan tidak ditemukan.' }
  if (currentListing.seller_id !== user.id) return { error: 'Anda tidak memiliki akses untuk mengedit lahan ini.' }

  let photos: string[] = currentListing.photos || []

  // 3. Handle File Upload if provided
  const file = formData.get('photo') as File
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `seller_edit_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

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

  // 4. Update into database (Resets status to PENDING_REVIEW)
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
    photos,
    status: 'PENDING_REVIEW' // Memerlukan review admin lagi setelah diedit
  }

  const { error: dbError } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id)
    .eq('seller_id', user.id)

  if (dbError) {
    console.error('DB Error:', dbError)
    return { error: 'Gagal menyimpan data: ' + dbError.message }
  }

  // 5. Success
  revalidatePath('/dashboard')
  revalidatePath('/admin/listings')
  revalidatePath('/jelajahi')
  
  return { success: true }
}
