import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const PromptsPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promptCollections = [
    {
      id: 'p1',
      title: 'Principal Software Engineer Code Reviewer',
      target: 'Claude 3.5 Sonnet / ChatGPT',
      category: 'Software Engineering',
      prompt: `You are a Principal Software Architect conducting a rigorous peer review.
Examine the following code for:
1. Concurrency bottlenecks and race conditions.
2. Memory leaks and unclosed stream handles.
3. Edge-case exceptions and input injection risks.
Format feedback into a table with columns: [Severity: High/Med/Low], [File/Line], [Defect Explanation], [Concrete Remediation Snippet].`,
    },
    {
      id: 'p2',
      title: 'Senior Executive Communication Ghostwriter',
      target: 'Google Gemini 3.8 / ChatGPT',
      category: 'Business & Management',
      prompt: `You are an executive ghostwriter for a Fortune 500 CEO.
Transform the bulleted notes below into a high-stakes email to company stakeholders.
Constraints:
- Eliminate corporate clichés, buzzwords, and vague passive phrases.
- Use the Minto Pyramid Principle: lead with the core bottom-line conclusion first.
- Keep total word count under 250 words.`,
    },
    {
      id: 'p3',
      title: 'Socratic Concept Breakdown & Deep Study Tutor',
      target: 'Universal LLM',
      category: 'Learning & STEM',
      prompt: `You are a world-class university professor using the Socratic method.
Your goal is to help me deeply master the topic provided.
Rules:
- Do not dump long paragraphs of theory all at once.
- Explain the fundamental intuition first using a vivid real-world analogy.
- Pose one probing question at the end to verify my understanding before advancing.`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <SEOHead
        title="Curated AI System Prompts Directory | ClarifyAll"
        description="Free tested system prompts for software development, executive communication, and learning. Copy battle-tested blueprints for ChatGPT, Claude, and Gemini."
        canonical="https://clarifyall.com/prompts"
      />

      <Breadcrumbs items={[{ label: 'Prompts' }]} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Curated AI Prompts
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Battle-tested system prompt templates designed to eliminate AI hallucination.
        </p>
      </div>

      {/* Generator Callout */}
      <div className="p-5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Need a custom prompt for a specific task?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Use our AI Prompt Generator to automatically build structured blueprints with guardrails.
          </p>
        </div>
        <Link
          to="/tools/ai-prompt-generator"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] flex items-center justify-center shrink-0"
        >
          Open Prompt Generator
        </Link>
      </div>

      {/* Prompt Cards */}
      <div className="space-y-6">
        {promptCollections.map(p => (
          <div
            key={p.id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {p.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {p.title}
                </h3>
              </div>
              <button
                onClick={() => handleCopy(p.id, p.prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-center min-h-[36px]"
              >
                {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === p.id ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
              {p.prompt}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
