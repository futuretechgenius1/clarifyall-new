import React, { useState } from 'react';
import { Upload, Download, Maximize, Lock, Unlock, RefreshCw } from 'lucide-react';

export const ImageResizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setOriginalWidth(img.width);
          setOriginalHeight(img.height);
          setWidth(img.width);
          setHeight(img.height);
          generateResize(url, img.width, img.height);
        };
      };
      reader.readAsDataURL(selected);
    }
  };

  const generateResize = (srcUrl: string, w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    const img = new Image();
    img.src = srcUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        setResizedUrl(canvas.toDataURL('image/png'));
      }
    };
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && originalWidth > 0) {
      const newH = Math.round((val / originalWidth) * originalHeight);
      setHeight(newH);
      if (preview) generateResize(preview, val, newH);
    } else if (preview) {
      generateResize(preview, val, height);
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && originalHeight > 0) {
      const newW = Math.round((val / originalHeight) * originalWidth);
      setWidth(newW);
      if (preview) generateResize(preview, newW, val);
    } else if (preview) {
      generateResize(preview, width, val);
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    if (preview) generateResize(preview, w, h);
  };

  const handleDownload = () => {
    if (!resizedUrl || !file) return;
    const link = document.createElement('a');
    link.href = resizedUrl;
    link.download = `resized_${width}x${height}_${file.name}`;
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
            id="img-resize-upload"
            className="hidden"
          />
          <label htmlFor="img-resize-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Maximize className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Select image to resize
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supports custom pixel dimensions and social media presets.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose Image
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Original: {originalWidth} × {originalHeight} px
            </span>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResizedUrl(null);
              }}
              className="text-xs text-slate-500 hover:text-red-500 p-2 min-h-[44px]"
            >
              Change Image
            </button>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Popular Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Square (1080×1080)', w: 1080, h: 1080 },
                { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
                { label: 'Social Banner (1200×630)', w: 1200, h: 630 },
                { label: 'Profile (400×400)', w: 400, h: 400 },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Width / Height Inputs with Lock */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="10"
                max="8000"
                value={width}
                onChange={e => handleWidthChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="10"
                max="8000"
                value={height}
                onChange={e => handleHeightChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-end h-full pb-1">
              <button
                onClick={() => setLockRatio(!lockRatio)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors w-full justify-center min-h-[44px] ${
                  lockRatio
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                {lockRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockRatio ? 'Ratio Locked' : 'Ratio Free'}</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center max-h-[300px] overflow-hidden">
            {resizedUrl && (
              <img
                src={resizedUrl}
                alt="Resized Preview"
                className="max-h-[280px] object-contain rounded"
              />
            )}
          </div>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download Resized Image ({width} × {height} px)</span>
          </button>
        </div>
      )}
    </div>
  );
};
