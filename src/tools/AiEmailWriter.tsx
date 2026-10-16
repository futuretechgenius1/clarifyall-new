import React, { useState } from 'react';
import { Mail, Sparkles, Copy, Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export const AiEmailWriterTool: React.FC = () => {
  const [purpose, setPurpose] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Professional & Polite');
  const [keyPoints, setKeyPoints] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ provider?: string; model?: string; tokens?: number } | null>(null);

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      setError('Please provide the main purpose or topic of your email.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/tools/ai-email-writer/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: purpose.trim(),
          audience: audience.trim(),
          tone,
          keyPoints: keyPoints.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.emailContent) {
        setResult(data.data.emailContent);
        setMetadata({
          provider: data.data.provider,
          model: data.data.model,
          tokens: data.data.tokensUsed,
        });
      } else {
        setError(data.error || 'Failed to generate email.');
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            What is the purpose of this email? *
          </label>
          <input
            type="text"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="e.g. Follow up on project proposal, request meeting, salary negotiation"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Who is the recipient / audience?
          </label>
          <input
            type="text"
            value={audience}
            onChange={e => setAudience(e.target.value)}
            placeholder="e.g. Hiring Manager, Client, Team Lead, Vendor"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tone of Voice
          </label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Professional & Polite">Professional &amp; Polite</option>
            <option value="Warm & Friendly">Warm &amp; Friendly</option>
            <option value="Concise & Direct (Executive)">Concise &amp; Direct (Executive)</option>
            <option value="Urgent & Action-Oriented">Urgent &amp; Action-Oriented</option>
            <option value="Formal & Legal">Formal &amp; Legal</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Key points to include (optional)
          </label>
          <input
            type="text"
            value={keyPoints}
            onChange={e => setKeyPoints(e.target.value)}
            placeholder="e.g. Attached Q3 report, available Thursday afternoon"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !purpose.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Drafting email with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>{result ? 'Regenerate Email' : 'Generate Email Draft'}</span>
          </>
        )}
      </button>

      {result && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">Generated Email</span>
              {metadata && (
                <span>• {metadata.provider} ({metadata.model})</span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors min-h-[36px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Email'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100 font-sans">
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
