import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Wrench, BookOpen, Compass, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ tools: any[]; articles: any[]; aiTools: any[] }>({
    tools: [],
    articles: [],
    aiTools: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults({ tools: [], articles: [], aiTools: [] });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ tools: [], articles: [], aiTools: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.results) {
          setResults(data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchOpen) return null;

  const handleSelect = (url: string) => {
    setSearchOpen(false);
    navigate(url);
  };

  const hasResults = results.tools.length > 0 || results.articles.length > 0 || results.aiTools.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 sm:pt-20 transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="relative flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search all utilities, PDF tools, guides, or AI directories..."
            className="w-full py-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0 mr-2" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2 rounded"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Quick Suggestions</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['PDF Compressor', 'Resume Bullet Improver', 'Image to Text OCR', 'AI Email Writer', 'Word Counter'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">No matching utilities or guides</p>
              <p className="text-xs mt-1">Try searching for "PDF", "Resume", "Image", or "AI"</p>
            </div>
          )}

          {results.tools.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                <Wrench className="w-3.5 h-3.5" />
                <span>Utilities & Tools ({results.tools.length})</span>
              </div>
              <div className="space-y-1">
                {results.tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(`/tools/${tool.slug}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.articles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guides & Articles ({results.articles.length})</span>
              </div>
              <div className="space-y-1">
                {results.articles.map(art => (
                  <button
                    key={art.id}
                    onClick={() => handleSelect(`/guides/${art.slug}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {art.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {art.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.aiTools.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>AI Tool Directory ({results.aiTools.length})</span>
              </div>
              <div className="space-y-1">
                {results.aiTools.map(at => (
                  <button
                    key={at.id}
                    onClick={() => handleSelect(`/ai-tools/${at.slug}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {at.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {at.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
