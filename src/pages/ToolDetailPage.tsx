import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SEOHead } from '../components/SEOHead';
import { ToolCard } from '../components/ToolCard';
import { AdSlot } from '../components/AdSlot';
import { ToolReviewSection } from '../components/ToolReviewSection';
import { Tool, ToolReviewStats } from '../types';

// Tools UI components
import { PdfCompressorTool } from '../tools/PdfCompressor';
import { PdfMergeTool } from '../tools/PdfMerge';
import { PdfSplitTool } from '../tools/PdfSplit';
import { PdfToImageTool } from '../tools/PdfToImage';
import { ImageToTextTool } from '../tools/ImageToText';
import { ImageCompressorTool } from '../tools/ImageCompressor';
import { ImageResizerTool } from '../tools/ImageResizer';
import { ImageConverterTool } from '../tools/ImageConverter';
import { WordCounterTool } from '../tools/WordCounter';
import { TextFormatterTool } from '../tools/TextFormatter';
import { AiEmailWriterTool } from '../tools/AiEmailWriter';
import { TextSummarizerTool } from '../tools/TextSummarizer';
import { ResumeBulletImproverTool } from '../tools/ResumeBulletImprover';
import { AiPromptGeneratorTool } from '../tools/AiPromptGenerator';
import { useApp } from '../context/AppContext';

export const ToolDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isFavorite, toggleFavorite } = useApp();
  const [tool, setTool] = useState<(Tool & { category?: any; relatedToolItems?: Tool[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ratingStats, setRatingStats] = useState<ToolReviewStats>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const favorited = tool ? isFavorite(tool.slug) : false;

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/v1/tools/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTool(data.data);
          if (data.data.reviewStats) {
            setRatingStats(prev => ({
              ...prev,
              averageRating: Number(data.data.reviewStats.averageRating || 5.0),
              totalReviews: Number(data.data.reviewStats.totalReviews || 0),
            }));
          }
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <Icons.Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading utility interface...</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Icons.AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tool Not Found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The requested utility could not be located.
        </p>
        <Link
          to="/tools"
          className="inline-block mt-6 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm"
        >
          Browse All Available Tools
        </Link>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (tool.slug) {
      case 'pdf-compressor':
        return <PdfCompressorTool />;
      case 'pdf-merge':
        return <PdfMergeTool />;
      case 'pdf-split':
        return <PdfSplitTool />;
      case 'pdf-to-image':
        return <PdfToImageTool />;
      case 'image-to-text':
        return <ImageToTextTool />;
      case 'image-compressor':
        return <ImageCompressorTool />;
      case 'image-resizer':
        return <ImageResizerTool />;
      case 'image-converter':
        return <ImageConverterTool />;
      case 'word-counter':
        return <WordCounterTool />;
      case 'text-formatter':
        return <TextFormatterTool />;
      case 'ai-email-writer':
        return <AiEmailWriterTool />;
      case 'text-summarizer':
        return <TextSummarizerTool />;
      case 'resume-bullet-improver':
        return <ResumeBulletImproverTool />;
      case 'ai-prompt-generator':
        return <AiPromptGeneratorTool />;
      default:
        return (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Tool interface loading...</p>
          </div>
        );
    }
  };

  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;

  const jsonLdSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': tool.name,
    'description': tool.description,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
  };

  if (ratingStats.totalReviews > 0) {
    jsonLdSchema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': ratingStats.averageRating,
      'reviewCount': ratingStats.totalReviews,
      'bestRating': 5,
      'worstRating': 1,
    };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <SEOHead
        title={tool.seoTitle || `${tool.name} – Free Online Utility | ClarifyAll`}
        description={tool.seoDescription || tool.description}
        canonical={`https://clarifyall.com/tools/${tool.slug}`}
        schema={jsonLdSchema}
      />

      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'All Tools', href: '/tools' },
          ...(tool.category ? [{ label: tool.category.name, href: `/categories/${tool.category.slug}` }] : []),
          { label: tool.name },
        ]}
      />

      {/* 2. Tool Header (Compact, no giant hero pushing the tool down) */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h1>

            {/* Rating Jump Pill */}
            <a
              href="#reviews-section"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100/70 dark:hover:bg-amber-950/70 transition-colors shadow-2xs group"
              title="Jump to user ratings & reviews"
            >
              <Icons.Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{ratingStats.averageRating.toFixed(1)}</span>
              <span className="font-normal text-amber-700/80 dark:text-amber-400/80">
                ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </a>

            <button
              onClick={() => toggleFavorite(tool.slug)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border min-h-[36px] ${
                favorited
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
              title={favorited ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Icons.Star className={`w-4 h-4 ${favorited ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save Tool'}</span>
            </button>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {tool.description}
          </p>
        </div>
      </div>

      {/* 3. PRIMARY TOOL INTERACTION (Visible immediately on mobile) */}
      <section aria-label="Interactive Tool Workspace">
        {renderToolComponent()}
      </section>

      {/* Optional In-Page Ad Placement Below Results */}
      <AdSlot slotKey="tool_below_result" />

      {/* 4. Instructions & Content */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            About This Utility
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {tool.introContent}
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            How to Use {tool.name}
          </h2>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
            {tool.howToContent}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <Icons.ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Files and text are processed in volatile memory. No permanent retention or AI model training.</span>
        </div>
      </section>

      {/* 5. User Ratings & Reviews Component */}
      <ToolReviewSection
        toolSlug={tool.slug}
        toolName={tool.name}
        onRatingUpdated={(newStats) => setRatingStats(newStats)}
      />

      {/* 6. FAQs */}
      {tool.faqJson && tool.faqJson.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {tool.faqJson.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 min-h-[44px]"
                  >
                    <span>{faq.question}</span>
                    <Icons.ChevronDown
                      className={`w-4 h-4 text-slate-400 transform transition-transform shrink-0 ml-2 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Related Tools */}
      {tool.relatedToolItems && tool.relatedToolItems.length > 0 && (
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Related Utilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tool.relatedToolItems.map(rt => (
              <ToolCard key={rt.id} tool={rt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
