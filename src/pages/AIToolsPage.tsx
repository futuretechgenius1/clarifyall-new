import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ExternalLink, ArrowRight, Bookmark, Search, Filter, Sparkles } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AiToolCard } from '../components/AiToolCard';
import { NewsletterSubscription } from '../components/NewsletterSubscription';
import { AiToolItem } from '../types';
import { useApp } from '../context/AppContext';

export const AIToolsPage: React.FC = () => {
  const [aiTools, setAiTools] = useState<AiToolItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState<boolean>(false);
  const { bookmarks, isBookmarked } = useApp();

  useEffect(() => {
    fetch('/api/v1/ai-tools')
      .then(res => res.json())
      .then(data => data.success && setAiTools(data.data));
  }, []);

  // Compute all unique categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    aiTools.forEach(t => {
      t.categories?.forEach(c => set.add(c));
    });
    return ['All', ...Array.from(set)];
  }, [aiTools]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    return aiTools.filter(tool => {
      if (filterBookmarkedOnly && !isBookmarked(tool.slug)) {
        return false;
      }
      if (selectedCategory !== 'All' && !tool.categories?.includes(selectedCategory)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesFeatures = tool.features?.some(f => f.toLowerCase().includes(q));
        const matchesCat = tool.categories?.some(c => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesFeatures && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [aiTools, filterBookmarkedOnly, isBookmarked, selectedCategory, searchQuery]);

  const bookmarkedCount = aiTools.filter(t => isBookmarked(t.slug)).length;

  return (
    <div className="space-y-8">
      <SEOHead
        title="AI Tool Directory & Product Reviews (2026) | ClarifyAll"
        description="Independent, verified directory of frontier AI models and tools: ChatGPT, Claude 3.5 Sonnet, Perplexity AI, Midjourney. Features, pricing, and limitations."
        canonical="https://clarifyall.com/ai-tools"
      />

      <Breadcrumbs items={[{ label: 'AI Directory' }]} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Tool Directory
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Independent reviews, transparent pricing models, and tested strengths of industry-leading AI tools.
          Save tools directly to your personal dashboard with 1-click bookmarks.
        </p>
      </div>

      {/* Comparison Callout */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Head-to-Head Comparison: ChatGPT vs Claude 3.5 Sonnet
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Compare context windows, coding benchmarks, and pricing tiers side-by-side.
          </p>
        </div>
        <Link
          to="/ai-tools/compare/chatgpt-vs-claude-3-5-sonnet"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] flex items-center justify-center shrink-0"
        >
          View Comparison
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search AI tools by name, features, or capability..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter: All vs Bookmarked Only */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFilterBookmarkedOnly(false)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors min-h-[38px] flex items-center gap-1.5 ${
                !filterBookmarkedOnly
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>All AI Tools</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 dark:bg-slate-300 text-slate-200 dark:text-slate-800 font-bold">
                {aiTools.length}
              </span>
            </button>

            <button
              onClick={() => setFilterBookmarkedOnly(true)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors min-h-[38px] flex items-center gap-1.5 ${
                filterBookmarkedOnly
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${filterBookmarkedOnly ? 'fill-white' : ''}`} />
              <span>Bookmarked</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterBookmarkedOnly
                    ? 'bg-white text-indigo-600'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {bookmarkedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map(item => (
            <AiToolCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {filterBookmarkedOnly ? 'No AI tools bookmarked yet' : 'No tools match your criteria'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {filterBookmarkedOnly
              ? 'Click the Bookmark button on any AI tool card to save items directly for quick access in your dashboard.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          {filterBookmarkedOnly ? (
            <button
              onClick={() => setFilterBookmarkedOnly(false)}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Show All AI Tools
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Weekly AI Tools Newsletter Subscription Section */}
      <NewsletterSubscription
        variant="banner"
        title="Stay Ahead: Weekly AI Tools & Directory Updates"
        subtitle="Subscribe to get weekly reports on new AI tools added to ClarifyAll, benchmark breakthroughs, and verified developer utilities delivered directly to your inbox every Friday."
        source="ai_tools_directory_page"
        className="mt-12"
      />
    </div>
  );
};
