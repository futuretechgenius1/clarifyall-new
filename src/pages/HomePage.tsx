import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ChevronDown,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { ToolCard } from '../components/ToolCard';
import { CategoryCard } from '../components/CategoryCard';
import { AdSlot } from '../components/AdSlot';
import { NewsletterSubscription } from '../components/NewsletterSubscription';
import { Tool, Category, Article } from '../types';

export const HomePage: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial homepage data
    fetch('/api/v1/tools?featured=true')
      .then(res => res.json())
      .then(data => data.success && setTools(data.data))
      .catch(console.error);

    fetch('/api/v1/categories')
      .then(res => res.json())
      .then(data => data.success && setCategories(data.data))
      .catch(console.error);

    fetch('/api/v1/articles?type=guide')
      .then(res => res.json())
      .then(data => data.success && setGuides(data.data.slice(0, 3)))
      .catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const faqs = [
    {
      q: 'Are all ClarifyAll tools completely free to use?',
      a: 'Yes! Every utility on ClarifyAll—including our PDF merger, image compressor, AI writing helpers, and word counter—is 100% free with no mandatory account creation or credit card required.',
    },
    {
      q: 'How does ClarifyAll protect my privacy and uploaded files?',
      a: 'Client-safe operations (such as word counting and local image resizing) execute entirely inside your browser. For utilities requiring server processing (such as PDF merging and AI inference), documents are kept only in volatile memory during the active session and are never retained permanently or used to train public machine learning models.',
    },
    {
      q: 'Can I use ClarifyAll on my smartphone?',
      a: 'ClarifyAll is engineered mobile-first. All tool interfaces, file uploaders, and downloads are optimized for touchscreens and narrow viewports from 320px up to widescreen desktops.',
    },
    {
      q: 'Which AI models power the writing and OCR tools?',
      a: 'Our smart productivity tools utilize state-of-the-art Google Gemini 3.8 Flash models through secure server-side adapters, ensuring rapid responses, strict safety guardrails, and no exposed API keys.',
    },
  ];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'ClarifyAll',
    'url': 'https://clarifyall.com/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://clarifyall.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    'description': 'Free online AI utilities, PDF tools, image compressors, writing assistants, and productivity calculators.',
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      <SEOHead
        title="ClarifyAll – AI Utilities & Productivity Platform | AI. Made Clear."
        description="Compress files, improve writing, summarize content, and discover smarter ways to work with free online utilities. 100% free, mobile-first, and private."
        schema={jsonLdSchema}
      />

      {/* SECTION 2: HERO */}
      <section className="pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI. Made Clear. • Fast, Free, No Signup</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Free Online Tools to <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Get Things Done
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Compress files, improve writing, summarize content, and discover smarter ways to work — all in one place with zero subscription friction.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto">
          <div className="relative flex items-center shadow-lg shadow-indigo-500/5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 p-1.5 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="What do you want to accomplish today? (e.g. compress pdf)"
              className="w-full py-3 px-3 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors shrink-0 min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Suggested Searches */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Popular:</span>
          {[
            { label: 'PDF Compressor', href: '/tools/pdf-compressor' },
            { label: 'Resume Improver', href: '/tools/resume-bullet-improver' },
            { label: 'Image to Text OCR', href: '/tools/image-to-text' },
            { label: 'AI Email Writer', href: '/tools/ai-email-writer' },
          ].map(item => (
            <Link
              key={item.label}
              to={item.href}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Optional Ad Slot */}
      <AdSlot slotKey="header_banner" />

      {/* SECTION 3: POPULAR TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Instant Utilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Popular Free Tools
            </h2>
          </div>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
          >
            <span>View All 14 Utilities</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid: 1-2 on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* SECTION 4: BROWSE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Browse by Category
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Find the right tools tailored to your immediate project, career, or publishing requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              How ClarifyAll Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
                1
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                Select Your Utility
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose from PDF compression, OCR extraction, AI writing, or word analysis without creating an account.
              </p>
            </div>

            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
                2
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                Enter Content or Upload
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drop your file or type your parameters. Real-time controls let you configure quality, tone, or page ranges.
              </p>
            </div>

            <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
                3
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                Download or Copy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Instant delivery directly to your device. Temporary data is purged automatically upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FEATURED GUIDES */}
      {guides.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Knowledge Base</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Featured Guides &amp; Tutorials
              </h2>
            </div>
            <Link
              to="/guides"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
            >
              <span>Explore All Guides</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map(guide => (
              <Link
                key={guide.id}
                to={`/guides/${guide.slug}`}
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Guide • {guide.authorName}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-2 transition-colors line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  <span>Read Full Tutorial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: TRUST & PRIVACY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 bg-slate-900 text-white rounded-3xl shadow-xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Lock className="w-4 h-4" />
              <span>Transparent Privacy Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How We Handle Your Data
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              We believe in honest disclosures. Here is precisely which tools operate in your browser vs on our servers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Browser-Executed Utilities</span>
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Word Counter, Text Formatter, and Image Resizer run directly in your local browser sandbox. Your inputs never reach our backend.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="font-semibold text-indigo-400 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Volatile Server Processing</span>
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  PDF compression, merging, and AI inference execute securely via encrypted TLS connections in temporary RAM and are purged immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7.5: NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsletterSubscription
          variant="banner"
          title="Stay Ahead: Weekly AI Tool Drops in Your Inbox"
          subtitle="Subscribe to get weekly updates on new AI tools added to the directory, frontier model benchmarks, and productivity utilities."
          source="home_page_banner"
        />
      </section>

      {/* SECTION 8: FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Questions &amp; Answers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transform transition-transform shrink-0 ml-3 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
