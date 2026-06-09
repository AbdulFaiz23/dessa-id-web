'use client'

import React, { useState } from 'react';
import { Check, Zap, ArrowRight, Loader2, ShieldCheck, Lock, X, QrCode, CreditCard, Copy, CheckCircle } from 'lucide-react';

export default function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'qris' | 'va' | 'processing' | 'success'>('method');

  const handleCheckoutOpen = (plan: string) => {
    setCheckoutPlan(plan);
    setPaymentStep('method');
  };

  const closeCheckout = () => {
    setCheckoutPlan(null);
  };

  const processSimulatedPayment = async () => {
    setPaymentStep('processing');
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: checkoutPlan })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Simulate network delay for realism
      setTimeout(() => {
        setPaymentStep('success');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, 2000);

    } catch (error: any) {
      alert('Gagal memproses langganan: ' + error.message);
      setPaymentStep('method');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Monthly Plan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col animate-fade-in-up delay-100 relative group">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Paket Bulanan</h3>
          <p className="text-slate-500 text-sm mb-6">Fleksibel untuk coba-coba</p>
          <div className="mb-8">
            <span className="text-4xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">Rp 49.000</span>
            <span className="text-slate-400 font-medium"> / bln</span>
          </div>
          
          <ul className="space-y-4 mb-10 flex-1">
            {[
              'Listing lahan tanpa batas',
              'Verifikasi prioritas admin',
              'Dukungan chat WhatsApp',
              'Analytics dasar (Segera)'
            ].map((feature, i) => (
              <li key={i} className="flex items-start text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600 font-bold" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="mt-auto">
            <button 
              onClick={() => handleCheckoutOpen('monthly')}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md flex justify-center items-center active:scale-95 mb-3"
            >
              Lanjutkan Pembayaran
            </button>
            <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3 mr-1" /> Checkout Aman
            </div>
          </div>
        </div>

        {/* Yearly Plan */}
        <div className="gradient-emerald rounded-3xl p-8 shadow-2xl relative flex flex-col transform md:-translate-y-4 animate-fade-in-up delay-200">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> PALING HEMAT (20%)
          </div>
          <h3 className="text-xl font-bold text-white mb-1 mt-2">Paket Tahunan</h3>
          <p className="text-emerald-100 text-sm mb-6">Investasi jangka panjang terbaik</p>
          <div className="mb-8 flex flex-col">
            <span className="text-sm text-emerald-200 line-through mb-1">Rp 588.000</span>
            <div>
              <span className="text-4xl font-extrabold text-white">Rp 450.000</span>
              <span className="text-emerald-200 font-medium"> / thn</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-10 flex-1">
            {[
              'Semua fitur paket Bulanan',
              'Badge khusus "Premium Seller"',
              'Prioritas #1 di hasil pencarian',
              'Bebas biaya admin selamanya'
            ].map((feature, i) => (
              <li key={i} className="flex items-start text-sm text-emerald-50 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 border border-emerald-400/50">
                  <Check className="w-3 h-3 text-white font-bold" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="mt-auto">
            <button 
              onClick={() => handleCheckoutOpen('yearly')}
              className="w-full py-4 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl flex justify-center items-center active:scale-95 group mb-3"
            >
              Checkout Langganan <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center text-[10px] text-emerald-100 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 mr-1" /> Garansi Aman 100%
            </div>
          </div>
        </div>
      </div>

      {/* ===== CHECKOUT MODAL ===== */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in-up scale-100">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2" />
                <h3 className="font-bold text-slate-800">Pembayaran Aman</h3>
              </div>
              {paymentStep !== 'processing' && paymentStep !== 'success' && (
                <button onClick={closeCheckout} className="p-2 bg-white rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-6">
              
              {/* Order Summary */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                  <p className="text-2xl font-black text-slate-900">
                    {checkoutPlan === 'yearly' ? 'Rp 450.000' : 'Rp 49.000'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Paket</p>
                  <p className="text-sm font-bold text-emerald-600">
                    {checkoutPlan === 'yearly' ? 'Tahunan (12 Bln)' : 'Bulanan (1 Bln)'}
                  </p>
                </div>
              </div>

              {/* STEP: Choose Method */}
              {paymentStep === 'method' && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-sm font-bold text-slate-700 mb-4">Pilih Metode Pembayaran</p>
                  <button onClick={() => setPaymentStep('qris')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-emerald-100">
                        <QrCode className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900">QRIS (Otomatis)</p>
                        <p className="text-xs text-slate-500">GoPay, OVO, DANA, BCA Mobile</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                  </button>
                  <button onClick={() => setPaymentStep('va')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-emerald-100">
                        <CreditCard className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900">Virtual Account</p>
                        <p className="text-xs text-slate-500">BCA, Mandiri, BRI, BNI</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                  </button>
                </div>
              )}

              {/* STEP: QRIS */}
              {paymentStep === 'qris' && (
                <div className="text-center animate-fade-in">
                  <p className="text-sm font-bold text-slate-700 mb-4">Scan QR Code dengan aplikasi e-wallet Anda</p>
                  <div className="w-48 h-48 border-4 border-slate-100 rounded-2xl mx-auto p-4 mb-6 flex items-center justify-center bg-white relative">
                    {/* Simulated QR Code using grid pattern */}
                    <div className="grid grid-cols-5 gap-1 w-full h-full opacity-80" style={{ background: 'repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #ffffff 10px, #ffffff 20px)'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-lg font-black text-emerald-600 text-xs">QRIS</div>
                    </div>
                  </div>
                  <button onClick={processSimulatedPayment} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
                    Saya Sudah Bayar
                  </button>
                  <button onClick={() => setPaymentStep('method')} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600">
                    Ganti Metode Pembayaran
                  </button>
                </div>
              )}

              {/* STEP: VA */}
              {paymentStep === 'va' && (
                <div className="text-center animate-fade-in">
                  <p className="text-sm font-bold text-slate-700 mb-4">Transfer ke Virtual Account BCA</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
                    <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-widest">Nomor Virtual Account</p>
                    <div className="flex items-center justify-center font-mono text-2xl font-black text-slate-900 tracking-wider">
                      8928 3391 0021 <Copy className="w-5 h-5 ml-3 text-slate-400 cursor-pointer hover:text-emerald-600" />
                    </div>
                  </div>
                  <button onClick={processSimulatedPayment} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
                    Saya Sudah Bayar
                  </button>
                  <button onClick={() => setPaymentStep('method')} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600">
                    Ganti Metode Pembayaran
                  </button>
                </div>
              )}

              {/* STEP: PROCESSING */}
              {paymentStep === 'processing' && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Memverifikasi Pembayaran...</h3>
                  <p className="text-sm text-slate-500">Mohon tunggu, jangan tutup halaman ini.</p>
                </div>
              )}

              {/* STEP: SUCCESS */}
              {paymentStep === 'success' && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-sm text-slate-500">Langganan Anda telah diaktifkan. Memuat ulang...</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center">
                <Lock className="w-3 h-3 mr-1" /> Transaksi dilindungi enkripsi SSL
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
