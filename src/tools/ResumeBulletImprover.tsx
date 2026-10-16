import React, { useState } from 'react';
import { Award, Sparkles, Copy, Check, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

export const ResumeBulletImproverTool: React.FC = () => {
  const [bullet, setBullet] = useState('');
  const [role, setRole] = useState('');
  const [targetField, setTargetField] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!bullet.trim() || bullet.trim().length < 5) {
      setError('Please provide a resume bullet point to optimize.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/tools/resume-bullet-improver/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet: bullet.trim(),
          role: role.trim(),
          targetField: targetField.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.improvedBullets) {
        setResult(data.data.improvedBullets);
      } else {
        setError(data.error || 'Failed to improve bullet point.');
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
      {/* Educational Callout */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-indigo-900 dark:text-indigo-300">
        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Google XYZ Formula Applied</p>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
            Every bullet is restructured around: <em>"Accomplished [X] as measured by [Y] by doing [Z]"</em>. Placeholders like <code>[X%]</code> are provided so you can plug in your genuine achievements.
          </p>
        </div>
      </div>

      {/* Bullet Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Your Current Resume Bullet Point *
        </label>
        <textarea
          value={bullet}
          onChange={e => setBullet(e.target.value)}
          placeholder="e.g. Managed social media accounts and created graphic assets for weekly campaigns."
          rows={3}
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Your Job Role / Title (Optional)
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Marketing Specialist, Software Engineer"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Target Industry / Field (Optional)
          </label>
          <input
            type="text"
            value={targetField}
            onChange={e => setTargetField(e.target.value)}
            placeholder="e.g. SaaS Tech, Healthcare, E-Commerce"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={handleImprove}
        disabled={loading || !bullet.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Elevating bullet impact with XYZ formula...</span>
          </>
        ) : (
          <>
            <Award className="w-5 h-5" />
            <span>Improve Resume Bullet</span>
          </>
        )}
      </button>

      {result && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
              Impact-Driven Alternatives
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg min-h-[36px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy All Options'}</span>
            </button>
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
