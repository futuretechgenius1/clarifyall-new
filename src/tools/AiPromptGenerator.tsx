import React, { useState } from 'react';
import { Terminal, Sparkles, Copy, Check, Download, Loader2, AlertCircle } from 'lucide-react';

export const AiPromptGeneratorTool: React.FC = () => {
  const [task, setTask] = useState('');
  const [targetModel, setTargetModel] = useState('Claude 3.5 Sonnet / ChatGPT');
  const [style, setStyle] = useState('Senior Technical Expert');
  const [constraints, setConstraints] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!task.trim()) {
      setError('Please describe what you want the AI to accomplish.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/tools/ai-prompt-generator/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.trim(),
          targetModel,
          style,
          constraints: constraints.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.generatedPrompt) {
        setResult(data.data.generatedPrompt);
      } else {
        setError(data.error || 'Failed to generate prompt template.');
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
    link.download = `prompt_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
      {/* Task Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          What is the primary task you want the AI to perform? *
        </label>
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="e.g. Conduct a thorough code review of TypeScript Express APIs focusing on memory leaks and security vulnerabilities."
          rows={3}
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Target AI Model
          </label>
          <select
            value={targetModel}
            onChange={e => setTargetModel(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Nuanced &amp; Artifacts)</option>
            <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o / Canvas)</option>
            <option value="Google Gemini 3.8">Google Gemini 3.8 Flash</option>
            <option value="Universal Frontier LLM">Universal Frontier LLM</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Persona / Persona Tone
          </label>
          <select
            value={style}
            onChange={e => setStyle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Senior Technical Expert">Senior Technical Expert</option>
            <option value="Executive Consultant">Executive Consultant</option>
            <option value="Socratic Tutor & Coach">Socratic Tutor &amp; Coach</option>
            <option value="Direct & Minimalist">Direct &amp; Minimalist (No Fluff)</option>
            <option value="Creative Strategist">Creative Strategist</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Specific Guardrails or Constraints (optional)
        </label>
        <input
          type="text"
          value={constraints}
          onChange={e => setConstraints(e.target.value)}
          placeholder="e.g. Return JSON only, never use apologies, cite specific RFC specifications"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !task.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors min-h-[44px] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Architecting system prompt...</span>
          </>
        ) : (
          <>
            <Terminal className="w-5 h-5" />
            <span>Generate Structured Prompt</span>
          </>
        )}
      </button>

      {result && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
              Battle-Tested Prompt Blueprint
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

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100 font-mono">
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
