import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Shield, Sparkles } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const AIToolComparePage: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'Primary Developer',
      chatgpt: 'OpenAI',
      claude: 'Anthropic',
    },
    {
      feature: 'Context Window Size',
      chatgpt: '128,000 tokens',
      claude: '200,000 tokens (Leading memory)',
    },
    {
      feature: 'Coding Benchmark (HumanEval)',
      chatgpt: '90.2%',
      claude: '92.0% (Artifacts workspace)',
    },
    {
      feature: 'Writing Nuance & Tone',
      chatgpt: 'Helpful, slightly conversational',
      claude: 'Natural, highly articulate, less sycophantic',
    },
    {
      feature: 'Pricing Model',
      chatgpt: 'Free tier / $20 Plus',
      claude: 'Free tier / $20 Pro',
    },
    {
      feature: 'Interactive Artifacts Canvas',
      chatgpt: 'Canvas mode (selective rollout)',
      claude: 'Artifacts (Full interactive code & React preview)',
    },
    {
      feature: 'Native Web Browsing',
      chatgpt: 'Yes (Live search integrated)',
      claude: 'Limited on base accounts',
    },
    {
      feature: 'Voice Conversation Mode',
      chatgpt: 'Advanced Voice Mode with emotion',
      claude: 'Text-first, no native voice mode',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEOHead
        title="ChatGPT vs Claude 3.5 Sonnet: Side-by-Side Comparison (2026) | ClarifyAll"
        description="Comprehensive head-to-head comparison between ChatGPT and Claude 3.5 Sonnet. Benchmarks, context window, coding capabilities, and pricing."
        canonical="https://clarifyall.com/ai-tools/compare/chatgpt-vs-claude-3-5-sonnet"
      />

      <Breadcrumbs
        items={[
          { label: 'AI Directory', href: '/ai-tools' },
          { label: 'ChatGPT vs Claude 3.5' },
        ]}
      />

      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Head-to-Head Comparison
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          ChatGPT vs Claude 3.5 Sonnet
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          An objective, benchmark-grounded comparison for developers, writers, and students.
        </p>
      </div>

      {/* Responsive Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-800/80 p-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
          <div className="col-span-1">Criteria</div>
          <div className="col-span-1 text-indigo-600 dark:text-indigo-400">ChatGPT (GPT-4o)</div>
          <div className="col-span-1 text-violet-600 dark:text-violet-400">Claude 3.5 Sonnet</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
          {comparisonRows.map((row, index) => (
            <div key={index} className="grid grid-cols-3 p-3.5 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors items-center">
              <div className="col-span-1 font-medium text-slate-700 dark:text-slate-300 pr-2">
                {row.feature}
              </div>
              <div className="col-span-1 text-slate-600 dark:text-slate-400 pr-2">
                {row.chatgpt}
              </div>
              <div className="col-span-1 font-semibold text-slate-900 dark:text-slate-100">
                {row.claude}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            The Verdict: Which Should You Choose?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            <strong>Choose Claude 3.5 Sonnet</strong> if your primary workloads involve software engineering, frontend web component development, deep document analysis, or long-form prose. Its Artifacts canvas feature and 200K token context window make it the premier technical workstation.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Choose ChatGPT</strong> if you require real-time web search integration, natural voice conversations via mobile, multimodal image generation through DALL·E 3, or a massive library of community Custom GPTs.
          </p>
        </div>
      </div>
    </div>
  );
};
