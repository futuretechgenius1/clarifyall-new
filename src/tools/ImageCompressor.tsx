import React, { useState } from 'react';
import { Upload, Download, CheckCircle, ImageDown, Loader2 } from 'lucide-react';

export const ImageCompressorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(75);
  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const [compressedBytes, setCompressedBytes] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        processCompression(url, selected.type, quality);
      };
      reader.readAsDataURL(selected);
    }
  };

  const processCompression = (dataUrl: string, mimeType: string, q: number) => {
    setLoading(true);
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const targetMime = mimeType === 'image/png' ? 'image/webp' : mimeType; // WebP or JPEG for lossy compression
        const resultUrl = canvas.toDataURL(targetMime, q / 100);
        setCompressedDataUrl(resultUrl);

        // Calculate approximate bytes from base64
        const head = `data:${targetMime};base64,`;
        const base64Str = resultUrl.replace(head, '');
        const byteCount = Math.round((base64Str.length * 3) / 4);
        setCompressedBytes(byteCount);
      }
      setLoading(false);
    };
    img.onerror = () => setLoading(false);
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (preview && file) {
      processCompression(preview, file.type, newQ);
    }
  };

  const handleDownload = () => {
    if (!compressedDataUrl || !file) return;
    const link = document.createElement('a');
    link.href = compressedDataUrl;
    const ext = compressedDataUrl.includes('image/webp') ? 'webp' : 'jpg';
    link.download = `compressed_${file.name.replace(/\.[^/.]+$/, '')}.${ext}`;
    link.click();
  };

  const savingsPct = file && compressedBytes > 0
    ? Math.max(0, Math.round(((file.size - compressedBytes) / file.size) * 100))
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm">
      {!preview ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            id="img-compress-upload"
            className="hidden"
          />
          <label htmlFor="img-compress-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <ImageDown className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Select an image to compress (JPG, PNG, WebP)
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time hardware-accelerated compression with preview.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose Image File
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Compression Settings
            </h3>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setCompressedDataUrl(null);
              }}
              className="text-xs text-slate-500 hover:text-red-500 p-2 min-h-[44px]"
            >
              Choose Different Image
            </button>
          </div>

          {/* Quality Slider */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Quality: {quality}%
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {quality >= 80 ? 'High Fidelity' : quality >= 60 ? 'Balanced Web' : 'Maximum Compression'}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              value={quality}
              onChange={e => handleQualityChange(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Metrics comparison */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 uppercase font-medium">Original</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {file ? (file.size / 1024).toFixed(1) : 0} KB
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-medium">Compressed</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {(compressedBytes / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/40">
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 uppercase font-medium">Saved</p>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                {savingsPct}%
              </p>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center max-h-[320px] overflow-hidden">
            {loading ? (
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            ) : (
              compressedDataUrl && (
                <img
                  src={compressedDataUrl}
                  alt="Compressed Preview"
                  className="max-h-[300px] object-contain rounded"
                />
              )
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Compressed Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
