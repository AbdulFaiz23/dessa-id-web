'use client'

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  name: string;
  onFileReady?: (file: File) => void;
  maxSizeMB?: number;
  watermarkText?: string;
}

export default function ImageUploader({
  name,
  onFileReady,
  maxSizeMB = 2,
  watermarkText = 'dessa.id',
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (file: File) => {
      setProcessing(true);
      setFileName(file.name);

      try {
        const img = new Image();
        const url = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Resize if needed (max 1600px width)
        let w = img.width;
        let h = img.height;
        const maxDim = 1600;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;

        // Draw image
        ctx.drawImage(img, 0, 0, w, h);

        // Add watermark
        const fontSize = Math.max(16, Math.floor(w / 30));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';

        // Center watermark
        const textX = w / 2;
        const textY = h / 2;

        // Rotate slightly for professionalism
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(-Math.PI / 12); // -15 degrees
        ctx.strokeText(watermarkText, 0, 0);
        ctx.fillText(watermarkText, 0, 0);

        // Repeat watermark pattern
        const offsets = [
          [-w * 0.3, -h * 0.25],
          [w * 0.3, h * 0.25],
          [-w * 0.3, h * 0.25],
          [w * 0.3, -h * 0.25],
        ];
        ctx.font = `bold ${Math.floor(fontSize * 0.7)}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        offsets.forEach(([ox, oy]) => {
          ctx.strokeText(watermarkText, ox, oy);
          ctx.fillText(watermarkText, ox, oy);
        });
        ctx.restore();

        // Corner watermark
        const smallFont = Math.max(12, Math.floor(w / 50));
        ctx.font = `600 ${smallFont}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.fillText(`© ${watermarkText}`, w - 12, h - 12);

        // Convert to blob with quality reduction if needed
        let quality = 0.9;
        let blob: Blob | null = null;

        do {
          blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
          });
          quality -= 0.1;
        } while (blob && blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1);

        if (blob) {
          const processedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
          });

          // Set preview
          const previewBlobUrl = URL.createObjectURL(blob);
          setPreviewUrl(previewBlobUrl);

          // Transfer file to hidden input via DataTransfer
          const dt = new DataTransfer();
          dt.items.add(processedFile);
          if (hiddenInputRef.current) {
            hiddenInputRef.current.files = dt.files;
          }

          onFileReady?.(processedFile);
        }

        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Image processing error:', err);
      } finally {
        setProcessing(false);
      }
    },
    [maxSizeMB, watermarkText, onFileReady]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (hiddenInputRef.current) {
      const dt = new DataTransfer();
      hiddenInputRef.current.files = dt.files;
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden input that carries the processed file for form submission */}
      <input
        type="file"
        name={name}
        ref={hiddenInputRef}
        className="hidden"
        accept="image/*"
      />
      {/* Visible file input for picking */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
          dragOver
            ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
            : previewUrl
            ? 'border-slate-200 bg-white'
            : 'border-slate-300 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/30'
        }`}
      >
        {processing ? (
          <div className="flex flex-col items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-600">
              Memproses & memasang watermark...
            </p>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center text-white text-xs font-medium">
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                {fileName}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg transition shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
            >
              Ganti Foto
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-1">
              Klik atau tarik foto ke sini
            </p>
            <p className="text-xs text-slate-500 mb-4">
              JPG, PNG, WebP · Maks {maxSizeMB}MB · Auto watermark & resize
            </p>
            <button
              type="button"
              className="bg-white border border-slate-300 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition pointer-events-none"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
