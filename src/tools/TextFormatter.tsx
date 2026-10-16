import React, { useState } from 'react';
import { Copy, Trash2, Check, AlignLeft, Sparkles } from 'lucide-react';

export const TextFormatterTool: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const toTitleCase = (str: string) => {
    const minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'via', 'vs'];
    return str.toLowerCase().replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
      if (index > 0 && index + match.length !== title.length &&
        minorWords.includes(match.toLowerCase()) &&
        title.charAt(index - 2) !== ':' &&
        (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
        title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase();
      }
      return match.charAt(0).toUpperCase() + match.substr(1);
    });
  };

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
      .replace(/\s+/g, '');
  };

  const toSlugify = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const cleanWhitespace = (str: string) => {
    return str
      .split('\n')
      .map(line => line.replace(/[ \t]+/g, ' ').trim())
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n')
      .trim();
  };

  const stripMarkdown = (str: string) => {
    return str
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^\s*[-+*]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
      {/* Transformation Action Buttons */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
          Transform Case &amp; Cleanup
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setText(text.toUpperCase())}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            UPPERCASE
          </button>
          <button
            onClick={() => setText(text.toLowerCase())}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            lowercase
          </button>
          <button
            onClick={() => setText(toTitleCase(text))}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            Title Case (AP Style)
          </button>
          <button
            onClick={() => setText(toSentenceCase(text))}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            Sentence case
          </button>
          <button
            onClick={() => setText(toCamelCase(text))}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            camelCase
          </button>
          <button
            onClick={() => setText(toSlugify(text))}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            URL-Slugify
          </button>
          <button
            onClick={() => setText(cleanWhitespace(text))}
            disabled={!text}
            className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            Clean Extra Spaces
          </button>
          <button
            onClick={() => setText(stripMarkdown(text))}
            disabled={!text}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-xs font-medium rounded-lg transition-colors min-h-[40px]"
          >
            Strip Markdown
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">
            {text.length} characters • {text.split(/\s+/).filter(Boolean).length} words
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-50 rounded-lg min-h-[36px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 disabled:opacity-50 rounded-lg min-h-[36px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste or type text to format..."
          rows={12}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};
