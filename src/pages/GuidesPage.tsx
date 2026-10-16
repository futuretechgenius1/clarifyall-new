import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, User, Calendar } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Article } from '../types';

export const GuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/v1/articles?type=guide')
      .then(res => res.json())
      .then(data => data.success && setGuides(data.data));
  }, []);

  return (
    <div className="space-y-8">
      <SEOHead
        title="Guides & Practical Tutorials | ClarifyAll"
        description="Comprehensive, step-by-step guides on PDF file optimization, prompt engineering, resume bullet writing, and digital productivity."
        canonical="https://clarifyall.com/guides"
      />

      <Breadcrumbs items={[{ label: 'Guides' }]} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Productivity Guides &amp; Tutorials
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          In-depth technical guides written by specialists. Zero filler, practical frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map(guide => (
          <Link
            key={guide.id}
            to={`/guides/${guide.slug}`}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all group"
          >
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span>By {guide.authorName}</span>
                <span>•</span>
                <span>Jan 2026</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {guide.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {guide.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Read Step-by-Step Guide</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
