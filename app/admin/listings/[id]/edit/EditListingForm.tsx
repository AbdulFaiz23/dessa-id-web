'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, MapPin, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { editListingAdmin } from '@/app/admin/actions';
import ImageUploader from '@/components/ImageUploader';

// Dynamic import for Leaflet map picking (ssr:false)
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[350px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-sm text-slate-400">Memuat peta...</div>
});

export default function EditListingForm({ listing }: { listing: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [fileReady, setFileReady] = useState<File | null>(null);
  
  // Coordinates & Location
  const [lat, setLat] = useState(listing.lat || -6.9667);
  const [lng, setLng] = useState(listing.lng || 110.4196);
  const [city, setCity] = useState(listing.city || '');
  const [address, setAddress] = useState(listing.address || '');

  const currentPhoto = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append('id', listing.id);
    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());
    formData.append('city', city);
    formData.append('address', address);
    
    if (fileReady) {
      formData.set('photo', fileReady);
    }

    const result = await editListingAdmin(formData);
    
    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result && result.success) {
      setSuccess(true);
      setLoading(false);
      // Wait a bit before redirecting
      setTimeout(() => {
        router.push('/admin/listings');
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold border border-emerald-100 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" /> Data berhasil diperbarui! Mengalihkan...
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Informasi Lahan</h2>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Judul Iklan</label>
          <input name="title" required defaultValue={listing.title} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Harga Total (Rp)</label>
            <input name="price" required defaultValue={listing.price} type="number" min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Luas Lahan (m²)</label>
            <input name="area_sqm" required defaultValue={listing.area_sqm} type="number" min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Status Sertifikat</label>
          <select name="document_type" required defaultValue={listing.document} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900 appearance-none">
            <option value="SHM">Sertifikat Hak Milik (SHM)</option>
            <option value="SHGB">Sertifikat Hak Guna Bangunan (SHGB)</option>
            <option value="AJB">Akta Jual Beli (AJB)</option>
            <option value="Girik">Girik / Petok D</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Deskripsi Lengkap</label>
          <textarea name="description" required defaultValue={listing.description} rows={5} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900 resize-none"></textarea>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Lokasi & Peta</h2>
        
        <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-slate-200 mb-6 shadow-inner relative z-0">
          <LeafletMap 
            center={[lat, lng]} 
            zoom={13} 
            draggable={true} 
            singleMarkerPosition={[lat, lng]}
            onPositionChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
            onLocationFound={(c, a) => {
              setCity(c);
              setAddress(a);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude</label>
            <div className="font-mono text-slate-700 text-sm">{lat.toFixed(6)}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude</label>
            <div className="font-mono text-slate-700 text-sm">{lng.toFixed(6)}</div>
          </div>
        </div>

        {address && (
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-start">
            <MapPin className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Alamat Terdeteksi</label>
              <div className="font-semibold text-slate-800 text-sm leading-tight">{address}</div>
              {city && <div className="text-xs text-emerald-700 mt-1 font-bold">{city}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Foto Lahan</h2>
        
        {currentPhoto && (
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Foto Saat Ini</label>
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentPhoto} alt="Foto Lahan" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Unggah Foto Baru (Akan Menggantikan Foto Lama)
          </label>
          <ImageUploader 
            name="photo_dummy"
            maxSizeMB={2}
            onFileReady={(file) => setFileReady(file)}
          />
          <p className="text-xs text-slate-500 mt-2">Biarkan kosong jika Anda tidak ingin mengubah foto lahan.</p>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-slate-100">
        <button 
          type="submit" 
          disabled={loading}
          className={`flex items-center px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
            loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'gradient-emerald hover:shadow-xl hover:shadow-emerald-600/30'
          }`}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
          ) : (
            <><UploadCloud className="w-5 h-5 mr-2" /> Simpan Perubahan</>
          )}
        </button>
      </div>

    </form>
  );
}
