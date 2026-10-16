import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, Loader2, FileText, Scissors } from 'lucide-react';

export const PdfSplitTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    filename: string;
    pdfBase64: string;
    outputSizeBytes: number;
    pageCount: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      setError(null);
      setFile(selected);
      setResult(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    if (!pageRange.trim()) {
      setError('Please specify the page range you wish to extract (e.g. 1-3, 5).');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/v1/tools/pdf-split/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: reader.result as string,
              pageRange: pageRange.trim(),
              filename: file.name,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setResult(data.data);
          } else {
            setError(data.error || 'Failed to split document.');
          }
        } catch (err: any) {
          setError(err.message || 'Network error.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm">
      {!file ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            id="pdf-split-upload"
            className="hidden"
          />
          <label htmlFor="pdf-split-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Scissors className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Select PDF file to extract pages
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supports page ranges such as "1-3, 5" or individual pages.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose PDF File
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3 truncate mr-3">
              <FileText className="w-7 h-7 text-indigo-500 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-xs text-slate-500 hover:text-red-500 p-2 min-h-[44px]"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Page Range to Extract
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={e => setPageRange(e.target.value)}
              placeholder="e.g. 1-3, 5, 8-10"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Enter individual pages separated by commas, or ranges with hyphens.
            </p>
          </div>

          {!result && (
            <button
              onClick={handleSplit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting pages...</span>
                </>
              ) : (
                <span>Extract Selected Pages</span>
              )}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Extracted {result.pageCount} page(s) successfully!</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Extracted PDF</span>
            </button>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors min-h-[44px]"
            >
              Split Another
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
