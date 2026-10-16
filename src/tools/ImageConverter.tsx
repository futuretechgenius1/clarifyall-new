import React, { useState } from 'react';
import { Upload, Download, RefreshCw, CheckCircle } from 'lucide-react';

export const ImageConverterTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'webp' | 'png' | 'jpeg'>('webp');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        convert(url, targetFormat);
      };
      reader.readAsDataURL(selected);
    }
  };

  const convert = (srcUrl: string, format: 'webp' | 'png' | 'jpeg') => {
    setLoading(true);
    const img = new Image();
    img.src = srcUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.92);
        setConvertedUrl(dataUrl);
      }
      setLoading(false);
    };
    img.onerror = () => setLoading(false);
  };

  const handleFormatChange = (fmt: 'webp' | 'png' | 'jpeg') => {
    setTargetFormat(fmt);
    if (preview) convert(preview, fmt);
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}_converted.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm">
      {!preview ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="img-convert-upload"
            className="hidden"
          />
          <label htmlFor="img-convert-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <RefreshCw className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Select image to convert
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Convert between WebP, PNG, and JPEG with instant download.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose Image
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{file?.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setConvertedUrl(null);
              }}
              className="text-xs text-slate-500 hover:text-red-500 p-2 min-h-[44px]"
            >
              Change Image
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Target Output Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'webp', name: 'WebP', note: 'Fast & Modern' },
                { id: 'png', name: 'PNG', note: 'Lossless & Alpha' },
                { id: 'jpeg', name: 'JPEG', note: 'Universal compatibility' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFormatChange(f.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all min-h-[60px] ${
                    targetFormat === f.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm">{f.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{f.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center max-h-[300px] overflow-hidden">
            {convertedUrl && (
              <img
                src={convertedUrl}
                alt="Converted Preview"
                className="max-h-[280px] object-contain rounded"
              />
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download Converted {targetFormat.toUpperCase()} Image</span>
          </button>
        </div>
      )}
    </div>
  );
};
