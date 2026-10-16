import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, ExternalLink, Check, X, ShieldCheck, Calendar, ArrowLeft, Bookmark } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AiToolItem } from '../types';
import { useApp } from '../context/AppContext';

export const AIToolDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<AiToolItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useApp();
  const bookmarked = item ? isBookmarked(item.slug) : false;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/ai-tools/${slug}`)
      .then(res => res.json())
      .then(data => data.success && setItem(data.data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Loading AI tool review...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Tool Not Found</h1>
        <Link to="/ai-tools" className="mt-4 inline-block text-indigo-600 text-sm">
          Browse AI Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEOHead
        title={`${item.name} Review, Features & Pricing (2026) | ClarifyAll`}
        description={item.description}
        canonical={`https://clarifyall.com/ai-tools/${item.slug}`}
      />

      <Breadcrumbs
        items={[
          { label: 'AI Directory', href: '/ai-tools' },
          { label: item.name },
        ]}
      />

      {/* Hero Header */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {item.pricingModel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Verified Jan 2026
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {item.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => item && toggleBookmark(item.slug)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0 min-h-[44px] ${
                bookmarked
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this AI tool'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{bookmarked ? 'Saved in Bookmarks' : 'Bookmark Tool'}</span>
            </button>

            <a
              href={item.vendorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors shrink-0 min-h-[44px]"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {item.description}
        </p>

        {/* Feature & Limitation Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Confirmed Features
            </h3>
            <ul className="space-y-2">
              {item.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Reported Limitations
            </h3>
            <ul className="space-y-2">
              {item.limitations && item.limitations.map((l, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <X className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Editorial In-Depth Review */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          ClarifyAll Editorial Evaluation
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {item.reviewContent}
        </p>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Independent review. ClarifyAll maintains objective editorial standards without paid vendor placement.</span>
        </div>
      </div>
    </div>
  );
};
