import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, ArrowLeft, ArrowRight, Share2, Check, BookOpen, Clock, ArrowUp } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AdSlot } from '../components/AdSlot';
import { Article } from '../types';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const articleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/articles/${slug}`)
      .then(res => res.json())
      .then(data => data.success && setArticle(data.data))
      .finally(() => setLoading(false));
  }, [slug]);

  // Calculate reading progress as user scrolls through article content
  useEffect(() => {
    if (!article) return;

    let ticking = false;

    const calculateProgress = () => {
      const element = articleContentRef.current;
      if (!element) {
        const winScroll = window.scrollY || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0) {
          setProgress(Math.min(100, Math.max(0, (winScroll / height) * 100)));
        }
        return;
      }

      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      // Start filling as soon as user scrolls past breadcrumbs into article header
      const startScroll = Math.max(0, elementTop - 120);
      // Reach 100% when user reaches near the bottom of the article body
      const endScroll = Math.max(startScroll + 1, elementTop + elementHeight - windowHeight * 0.4);
      const totalDistance = endScroll - startScroll;

      if (currentScroll <= startScroll) {
        setProgress(0);
      } else if (currentScroll >= endScroll) {
        setProgress(100);
      } else {
        const percentage = ((currentScroll - startScroll) / totalDistance) * 100;
        setProgress(Math.min(100, Math.max(0, percentage)));
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    calculateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [article]);

  const estimatedReadTime = useMemo(() => {
    if (!article?.body) return 3;
    const words = `${article.title} ${article.excerpt} ${article.body}`.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [article]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Loading guide...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <Link to="/guides" className="mt-4 inline-block text-indigo-600 text-sm">
          Browse All Guides
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt,
    'author': {
      '@type': 'Person',
      'name': article.authorName,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'ClarifyAll',
      'url': 'https://clarifyall.com/',
    },
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt,
  };

  return (
    <>
      {/* 1. Top of Viewport Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5 bg-slate-200/40 dark:bg-slate-800/40 pointer-events-none"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Article reading progress"
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(99,102,241,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 2. Sub-Header Reading Progress Bar (aligned directly under sticky nav header) */}
      <div
        className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-slate-200/30 dark:bg-slate-800/30 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div ref={articleContentRef} className="max-w-3xl mx-auto space-y-8 relative">
        <SEOHead
          title={article.seoTitle || `${article.title} | ClarifyAll`}
          description={article.seoDescription || article.excerpt}
          canonical={article.canonicalUrl || `https://clarifyall.com/guides/${article.slug}`}
          schema={jsonLdSchema}
        />

        <Breadcrumbs
          items={[
            { label: 'Guides', href: '/guides' },
            { label: article.title },
          ]}
        />

        {/* Article Header */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2]">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-500">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="font-medium text-slate-800 dark:text-slate-200">{article.authorName}</span>
              <span>•</span>
              <span>Updated {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{estimatedReadTime} min read</span>
              </span>
              {progress > 0 && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {Math.round(progress)}% read
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors min-h-[36px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Article Lead Excerpt */}
        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-indigo-600 pl-4 py-1 italic">
          {article.excerpt}
        </p>

        {/* Main Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
          {article.body}
        </article>

        {/* In-Article Non-Intrusive Ad Placement */}
        <AdSlot slotKey="in_article_banner" />

        {/* Interactive Tool Suggestion */}
        <div className="p-6 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Put This Guide Into Practice
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Try our free utilities to execute these principles in your workflow immediately.
            </p>
          </div>
          <Link
            to="/tools"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shrink-0 shadow-sm transition-colors min-h-[44px] flex items-center justify-center"
          >
            Open Free Tools
          </Link>
        </div>
      </div>

      {/* Floating Bottom-Right Reading Progress Pill */}
      {progress > 5 && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-full shadow-lg text-xs font-semibold text-slate-700 dark:text-slate-200 animate-fadeIn">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 dark:text-indigo-400 transition-all duration-150"
                strokeDasharray={`${progress}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span className="font-mono text-[11px]">{Math.round(progress)}%</span>
          <span className="hidden sm:inline text-slate-400 text-[10px]">read</span>
          <button
            onClick={scrollToTop}
            title="Scroll to top"
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5"
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
