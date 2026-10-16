import React, { useState } from 'react';
import { Upload, Copy, Download, Check, AlertCircle, Loader2, ScanText, RefreshCw } from 'lucide-react';

export const ImageToTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, WebP).');
        return;
      }
      setError(null);
      setFile(selected);
      setExtractedText(null);

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleOcr = async () => {
    if (!preview || !file) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/tools/image-to-text/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: preview,
          mimeType: file.type,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.extractedText) {
        setExtractedText(data.data.extractedText);
      } else {
        setError(data.error || 'No readable text was detected in this image.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while recognizing text.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted_ocr_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm">
      {!preview ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="ocr-upload"
            className="hidden"
          />
          <label htmlFor="ocr-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <ScanText className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Upload photo, screenshot, or scan for OCR
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supports JPEG, PNG, and WebP up to 15 MB.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose Image
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Input Image</span>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setExtractedText(null);
                  }}
                  className="text-xs text-slate-500 hover:text-red-500 p-1 min-h-[36px]"
                >
                  Change
                </button>
              </div>
              <img
                src={preview}
                alt="Source OCR Preview"
                className="max-h-[300px] w-full object-contain rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Extracted Text */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Extracted Text</span>
                {extractedText && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded min-h-[36px]"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded min-h-[36px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.txt</span>
                    </button>
                  </div>
                )}
              </div>

              <textarea
                value={extractedText || ''}
                readOnly
                placeholder={loading ? 'Extracting text with AI Vision OCR...' : 'Click "Extract Text" to process your image.'}
                rows={10}
                className="w-full flex-1 p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none resize-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleOcr}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scanning characters with Vision AI...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Extract Text with OCR</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
