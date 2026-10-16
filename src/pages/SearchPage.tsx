import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Wrench, BookOpen, Compass, ArrowRight, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ tools: any[]; articles: any[]; aiTools: any[] }>({
    tools: [],
    articles: [],
    aiTools: [],
  });

  useEffect(() => {
    setSearchInput(query);
    if (!query.trim()) {
      setResults({ tools: [], articles: [], aiTools: [] });
      return;
    }

    setLoading(true);
    fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.results) {
          setResults(data.results);
        }
      })
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const totalResults = results.tools.length + results.articles.length + results.aiTools.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEOHead
        title={`Search Results for "${query}" | ClarifyAll`}
        description={`Search results on ClarifyAll for ${query}. Free online utilities, PDF tools, AI writing helpers, and tutorials.`}
        canonical="https://clarifyall.com/search"
      />

      <Breadcrumbs items={[{ label: 'Search' }]} />

      <form onSubmit={handleSearchSubmit}>
        <div className="relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
          <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search all utilities, guides, and AI directories..."
            className="w-full py-3 px-3 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors shrink-0 min-h-[44px]"
          >
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Searching across ClarifyAll platform...</p>
        </div>
      ) : query && totalResults === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No matches found for "{query}"</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Try checking for typos or searching for a general keyword like "PDF", "image", "resume", or "compress".
          </p>
        </div>
      ) : query && totalResults > 0 ? (
        <div className="space-y-8">
          <p className="text-xs text-slate-500">
            Found {totalResults} result{totalResults === 1 ? '' : 's'} for "{query}"
          </p>

          {results.tools.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Utilities &amp; Tools ({results.tools.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.tools.map(tool => (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.slug}`}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{tool.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.articles.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Guides &amp; Articles ({results.articles.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.articles.map(art => (
                  <Link
                    key={art.id}
                    to={`/guides/${art.slug}`}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{art.excerpt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.aiTools.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>AI Tool Directory ({results.aiTools.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.aiTools.map(at => (
                  <Link
                    key={at.id}
                    to={`/ai-tools/${at.slug}`}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                        {at.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{at.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-sm">
          Enter a search query above to look up utilities, guides, and tools.
        </div>
      )}
    </div>
  );
};
