'use client'

import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, Info, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createListing } from '@/app/dashboard/actions';
import ImageUploader from '@/components/ImageUploader';

// Dynamic import for Leaflet map picking (ssr:false)
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-sm text-slate-400">Memuat peta...</div>
});

export default function NewListingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [fileReady, setFileReady] = useState<File | null>(null);

  // Default coordinate (Semarang center)
  const [lat, setLat] = useState(-6.9667);
  const [lng, setLng] = useState(110.4196);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());
    formData.append('city', city);
    formData.append('address', address);
    
    // Explicitly append the processed file from ImageUploader state if available
    if (fileReady) {
      formData.set('photo', fileReady);
    }

    if (!formData.get('photo') || (formData.get('photo') as File).size === 0) {
      setError('Mohon unggah setidaknya 1 foto lahan.');
      setStep(3); // Go back to photo step
      setLoading(false);
      return;
    }

    const result = await createListing(formData);
    
    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-3xl mx-auto pb-24">
      <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-emerald-600 text-sm font-bold mb-6 transition w-max">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
      </Link>
      
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Buat Listing Baru</h1>
        <p className="text-slate-500 font-medium">Lengkapi detail lahan Anda agar menarik minat investor.</p>
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 bg-white ${
              step === s ? 'border-emerald-600 text-emerald-600' : 
              step > s ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 text-slate-400'
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step >= s ? 'text-slate-700' : 'text-slate-400'}`}>
              {s === 1 ? 'Info' : s === 2 ? 'Lokasi' : 'Foto'}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 animate-fade-in-up">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* ===== STEP 1: INFO DASAR ===== */}
        <div className={`transition-all duration-500 ${step === 1 ? 'block animate-fade-in' : 'hidden'}`}>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Dasar Lahan</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Judul Iklan</label>
                <input name="title" required={step===1} type="text" placeholder="Cth: Tanah Sawah Produktif 1 Ha Pinggir Jalan Utama" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900 placeholder-slate-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Harga Total (Rp)</label>
                  <input name="price" required={step===1} type="number" min="0" placeholder="250000000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Luas Lahan (m²)</label>
                  <input name="area_sqm" required={step===1} type="number" min="1" placeholder="1200" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900 placeholder-slate-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Status Sertifikat</label>
                <select name="document_type" required={step===1} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900 appearance-none">
                  <option value="SHM">Sertifikat Hak Milik (SHM)</option>
                  <option value="SHGB">Sertifikat Hak Guna Bangunan (SHGB)</option>
                  <option value="AJB">Akta Jual Beli (AJB)</option>
                  <option value="Girik">Girik / Petok D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Deskripsi Lengkap</label>
                <textarea name="description" required={step===1} rows={5} placeholder="Jelaskan kondisi lahan, akses jalan (bisa masuk mobil/truk), ketersediaan air, dan potensi peruntukannya." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900 placeholder-slate-400 resize-none"></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95">
                Lanjut ke Lokasi
              </button>
            </div>
          </div>
        </div>

        {/* ===== STEP 2: LOKASI PETA ===== */}
        <div className={`transition-all duration-500 ${step === 2 ? 'block animate-fade-in' : 'hidden'}`}>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Tandai Lokasi Lahan</h2>
            <p className="text-slate-500 text-sm mb-6">Geser marker merah pada peta ke lokasi akurat lahan Anda.</p>
            
            <div className="bg-emerald-50 p-4 rounded-xl flex items-start mb-6 border border-emerald-100 shadow-sm">
              <Info className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                Fitur ini menggunakan React-Leaflet. Koordinat yang Anda tentukan akan terlihat oleh investor untuk survey. Pastikan posisinya tepat.
              </p>
            </div>
            
            {/* Interactive Leaflet Map picker */}
            <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-slate-200 mb-6 shadow-inner z-0 relative">
               {step === 2 && (
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
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude</label>
                <div className="font-mono text-slate-700 text-sm">{lat.toFixed(6)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude</label>
                <div className="font-mono text-slate-700 text-sm">{lng.toFixed(6)}</div>
              </div>
            </div>

            {address ? (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-8">
                <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Alamat Terdeteksi</label>
                <div className="font-semibold text-slate-800 text-sm leading-tight">{address}</div>
                {city && <div className="text-xs text-emerald-700 mt-1 font-bold">{city}</div>}
              </div>
            ) : (
              <div className="mb-8"></div>
            )}

            <div className="flex justify-between items-center">
              <button type="button" onClick={() => setStep(1)} className="text-slate-500 font-bold px-4 py-3 hover:text-slate-900 transition">
                Kembali
              </button>
              <button type="button" onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95">
                Lanjut ke Foto
              </button>
            </div>
          </div>
        </div>

        {/* ===== STEP 3: FOTO & SUBMIT ===== */}
        <div className={`transition-all duration-500 ${step === 3 ? 'block animate-fade-in' : 'hidden'}`}>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unggah Foto Lahan</h2>
            <p className="text-slate-500 text-sm mb-6">Foto berkualitas baik akan diproses dengan watermark &quot;dessa.id&quot; otomatis.</p>
            
            {/* Custom Image Uploader Component */}
            <div className="mb-8">
              <ImageUploader 
                name="photo_dummy" // Dummy name, we manually append to FormData
                maxSizeMB={2}
                onFileReady={(file) => setFileReady(file)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8">
              <p className="text-xs font-medium text-blue-800 leading-relaxed text-center">
                Setelah disubmit, listing akan berstatus <strong>PENDING_REVIEW</strong> dan menunggu persetujuan dari Admin sebelum tayang di publik.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setStep(2)} disabled={loading} className="text-slate-500 font-bold px-4 py-3 hover:text-slate-900 transition disabled:opacity-50">
                Kembali
              </button>
              <button 
                type="submit" 
                disabled={loading || !fileReady}
                className={`flex items-center px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                  loading || !fileReady ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'gradient-emerald hover:shadow-xl hover:shadow-emerald-600/30'
                }`}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mengunggah...</>
                ) : (
                  <><UploadCloud className="w-5 h-5 mr-2" /> Submit Listing</>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
