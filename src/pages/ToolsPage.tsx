import React, { useState, useEffect } from 'react';
import { Search, Wrench, Filter } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ToolCard } from '../components/ToolCard';
import { Tool, Category } from '../types';

export const ToolsPage: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/tools')
      .then(res => res.json())
      .then(data => data.success && setTools(data.data));

    fetch('/api/v1/categories')
      .then(res => res.json())
      .then(data => data.success && setCategories(data.data));
  }, []);

  const filteredTools = tools.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.categoryId === selectedCategory;
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <SEOHead
        title="All Free Online Tools & Utilities Directory | ClarifyAll"
        description="Browse all 14 free online PDF tools, image compressors, OCR scanners, AI writing assistants, and text formatting utilities on ClarifyAll."
        canonical="https://clarifyall.com/tools"
      />

      <Breadcrumbs items={[{ label: 'All Tools' }]} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          All Online Utilities
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Fast, browser-assisted and private tools designed to accelerate your everyday workflow.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Utilities ({tools.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter tools..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
          />
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No tools matched your filter</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearch('');
            }}
            className="mt-3 text-xs text-indigo-600 font-medium hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
