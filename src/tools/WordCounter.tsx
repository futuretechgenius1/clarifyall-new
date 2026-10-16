import React, { useState, useMemo } from 'react';
import { Copy, Trash2, Check, Hash, Clock, BookOpen, Volume2 } from 'lucide-react';

export const WordCounterTool: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMin: 0,
        speakingTimeMin: 0,
      };
    }

    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, '').length;
    const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (trimmed ? 1 : 0);
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const readingTimeMin = Math.ceil(words / 225);
    const speakingTimeMin = Math.ceil(words / 130);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
    };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Words</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.words}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Characters</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{stats.characters}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Sentences</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{stats.sentences}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Paragraphs</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{stats.paragraphs}</p>
        </div>
      </div>

      {/* Auxiliary Timing Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs sm:text-sm text-indigo-900 dark:text-indigo-300">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Reading time: ~{stats.readingTimeMin} min (225 wpm)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Speaking time: ~{stats.speakingTimeMin} min (130 wpm)</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          Chars (no spaces): {stats.charactersNoSpaces}
        </div>
      </div>

      {/* Text Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Document Content
          </label>
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
          placeholder="Start typing or paste your text here to see real-time statistics..."
          rows={12}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};
