import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, Loader2, RefreshCw, FileText } from 'lucide-react';

export const PdfCompressorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    filename: string;
    pdfBase64: string;
    originalSizeBytes: number;
    outputSizeBytes: number;
    reductionPercentage: number;
    pageCount: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      if (selected.size > 25 * 1024 * 1024) {
        setError('File size exceeds the 25 MB limit.');
        return;
      }
      setError(null);
      setFile(selected);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please drop a valid PDF file.');
        return;
      }
      setError(null);
      setFile(selected);
      setResult(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/v1/tools/pdf-compressor/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64,
              filename: file.name,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setResult(data.data);
          } else {
            setError(data.error || 'Failed to compress document.');
          }
        } catch (err: any) {
          setError(err.message || 'Network error occurred while compressing.');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file from disk.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${result.pdfBase64}`;
    link.download = result.filename;
    link.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm">
      {/* Upload Zone */}
      {!file && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/50"
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            id="pdf-upload"
            className="hidden"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Click to select or drag and drop your PDF
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supports standard PDFs up to 25 MB. Fast &amp; private processing.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose PDF File
            </span>
          </label>
        </div>
      )}

      {/* Selected File Details & Actions */}
      {file && !result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3 truncate mr-3">
              <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Original size: {formatBytes(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-xs text-slate-500 hover:text-red-500 p-2 rounded shrink-0 min-h-[44px]"
            >
              Change File
            </button>
          </div>

          <button
            onClick={handleCompress}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Optimizing object streams...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Compress PDF Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Compression Result Panel */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Compression Complete!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[11px] text-slate-500 uppercase font-medium">Original</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatBytes(result.originalSizeBytes)}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[11px] text-slate-500 uppercase font-medium">Compressed</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatBytes(result.outputSizeBytes)}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[11px] text-slate-500 uppercase font-medium">Saved</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {result.reductionPercentage}%
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-2xs border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[11px] text-slate-500 uppercase font-medium">Pages</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {result.pageCount}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              Internal fonts and vector outlines have been verified for readability.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Compressed PDF</span>
            </button>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors min-h-[44px]"
            >
              Compress Another
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
