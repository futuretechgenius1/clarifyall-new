import React, { useState } from 'react';
import { FileSpreadsheet, Sparkles, Copy, Check, Download, Loader2, AlertCircle } from 'lucide-react';

export const TextSummarizerTool: React.FC = () => {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<'bullets' | 'executive' | 'tldr'>('bullets');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Please provide at least 20 characters of text to summarize.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/tools/text-summarizer/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          format,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.summary) {
        setResult(data.data.summary);
      } else {
        setError(data.error || 'Failed to summarize text.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while contacting AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `summary_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
      {/* Format Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Summary Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'bullets', label: 'Key Bullet Points', desc: '4-6 crucial takeaways' },
            { id: 'executive', label: 'Executive Overview', desc: 'Structured memo summary' },
            { id: 'tldr', label: 'Concise TL;DR', desc: 'Quick 2-sentence gist' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id as any)}
              className={`p-3 rounded-xl border text-left transition-all min-h-[50px] ${
                format === opt.id
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Text Area */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Original Document / Article Text
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste article, research findings, meeting transcript, or memo here..."
          rows={9}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          {text.split(/\s+/).filter(Boolean).length} words entered.
        </p>
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || text.trim().length < 20}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Condensing document with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Summarize Content Now</span>
          </>
        )}
      </button>

      {result && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
              AI Summary Result
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg min-h-[36px]"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg min-h-[36px]"
              >
                <Download className="w-4 h-4" />
                <span>Save .md</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
            {result}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
