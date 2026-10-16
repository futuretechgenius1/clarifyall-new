import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, Loader2, FileText, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  base64?: string;
}

export const PdfMergeTool: React.FC = () => {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    filename: string;
    pdfBase64: string;
    outputSizeBytes: number;
    pageCount: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const valid = selected.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (valid.length === 0) {
        setError('Please select valid PDF documents.');
        return;
      }
      setError(null);
      const newItems: PdfFileItem[] = valid.map(f => ({
        id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        name: f.name,
        size: f.size,
      }));
      setFiles(prev => [...prev, ...newItems]);
      setResult(null);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least two PDF files to merge.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Convert all files to base64
      const filePayloads = await Promise.all(
        files.map(
          f =>
            new Promise<{ name: string; fileBase64: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: f.name, fileBase64: reader.result as string });
              reader.onerror = () => reject(new Error(`Failed to read ${f.name}`));
              reader.readAsDataURL(f.file);
            })
        )
      );

      const res = await fetch('/api/v1/tools/pdf-merge/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filePayloads }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to merge documents.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during merging.');
    } finally {
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
      {/* File List / Drag Zone */}
      {files.length === 0 ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer">
          <input
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            id="pdf-merge-upload"
            className="hidden"
          />
          <label htmlFor="pdf-merge-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Select 2 or more PDF files to merge
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              You can easily reorder files before creating your final unified document.
            </p>
            <span className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors">
              Choose PDF Files
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
              PDF Sequence ({files.length} documents)
            </h3>
            <label
              htmlFor="pdf-merge-add"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More</span>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                id="pdf-merge-add"
                className="hidden"
              />
            </label>
          </div>

          {/* List of files with order controls */}
          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl"
              >
                <div className="flex items-center gap-3 truncate mr-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="Move file up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="Move file down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/40 min-h-[36px] min-w-[36px] flex items-center justify-center ml-1"
                    aria-label="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!result && (
            <button
              onClick={handleMerge}
              disabled={loading || files.length < 2}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Merging PDF files...</span>
                </>
              ) : (
                <span>Merge {files.length} PDFs</span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Result Panel */}
      {result && (
        <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>PDFs Merged Successfully!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Created a unified document containing {result.pageCount} total pages ({Math.round(result.outputSizeBytes / 1024)} KB).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Combined PDF</span>
            </button>
            <button
              onClick={() => {
                setFiles([]);
                setResult(null);
              }}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors min-h-[44px]"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
