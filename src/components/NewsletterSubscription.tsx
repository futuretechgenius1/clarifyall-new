import React, { useState, useEffect } from 'react';
import {
  Mail,
  Sparkles,
  CheckCircle2,
  Bell,
  Calendar,
  Shield,
  ArrowRight,
  Loader2,
  Check,
  Zap,
  Layers,
  Code2,
  PenTool,
  Image as ImageIcon,
  Cpu,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { NewsletterStats } from '../types';

export interface NewsletterSubscriptionProps {
  variant?: 'banner' | 'card' | 'compact';
  title?: string;
  subtitle?: string;
  source?: string;
  defaultCategory?: string;
  className?: string;
}

const AVAILABLE_TOPICS = [
  { id: 'all', label: 'All AI Tool Drops', icon: Sparkles },
  { id: 'ai-writing', label: 'Writing & LLMs', icon: PenTool },
  { id: 'coding', label: 'Developer & Code Tools', icon: Code2 },
  { id: 'image-utilities', label: 'Image & Video AI', icon: ImageIcon },
  { id: 'productivity', label: 'Workflow & Automation', icon: Zap },
  { id: 'research', label: 'Research & Reasoning', icon: Cpu },
];

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  variant = 'banner',
  title = 'Get Weekly AI Tool Drops in Your Inbox',
  subtitle = 'Discover freshly launched AI models, open-source productivity utilities, and benchmark comparisons before they go viral.',
  source = 'web_general',
  defaultCategory,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    defaultCategory ? [defaultCategory] : ['all']
  );
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showIssuePreview, setShowIssuePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<NewsletterStats | null>(null);

  useEffect(() => {
    fetch('/api/v1/newsletter/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(() => {
        // graceful fallback stats
        setStats({
          subscriberCount: 2483,
          frequency: 'Every Friday at 9:00 AM UTC',
          nextEditionDate: 'This Friday',
          curatedCategories: ['LLMs', 'Developer Tools', 'Image Synthesis'],
        });
      });
  }, []);

  const toggleTopic = (id: string) => {
    if (id === 'all') {
      setSelectedTopics(['all']);
      return;
    }
    const filtered = selectedTopics.filter(t => t !== 'all');
    if (filtered.includes(id)) {
      const next = filtered.filter(t => t !== id);
      setSelectedTopics(next.length > 0 ? next : ['all']);
    } else {
      setSelectedTopics([...filtered, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          categories: selectedTopics.includes('all') ? ['ai-writing', 'coding', 'productivity', 'image-utilities'] : selectedTopics,
          frequency,
          source,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'You are all set! Check your inbox this Friday for new tool drops.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Unable to subscribe right now. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network error. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // COMPACT VARIANT (FOOTER & SIDEBARS)
  // ==========================================
  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Weekly AI Drops</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Never miss a top AI tool
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Weekly curated digest of new models & verified utilities.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Subscribed!</p>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">{message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work or personal email..."
                aria-label="Email address for weekly updates"
                required
                className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70 cursor-pointer min-h-[38px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <span>Join Weekly Digest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {status === 'error' && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {message}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                No spam guarantee
              </span>
              <span>1-click unsubscribe</span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ==========================================
  // CARD VARIANT (DIRECTORY / EMBEDDED)
  // ==========================================
  if (variant === 'card') {
    return (
      <div className={`p-6 sm:p-8 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl shadow-sm ${className}`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Bell className="w-3.5 h-3.5" />
            <span>Weekly Directory Roundup</span>
          </div>
          {stats && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Next Drop: <strong className="text-slate-700 dark:text-slate-300">{stats.nextEditionDate}</strong>
            </span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {subtitle}
        </p>

        {status === 'success' ? (
          <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Subscription Activated!</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {message}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Cadence: {frequency === 'weekly' ? 'Every Friday morning' : 'Bi-weekly'}
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setEmail('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@organization.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 cursor-pointer min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {message}
              </p>
            )}

            {/* Topic pill choices */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Filter by your interests (optional):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TOPICS.map(topic => {
                  const active = selectedTopics.includes(topic.id);
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{topic.label}</span>
                      {active && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-indigo-100/60 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Join {stats?.subscriberCount.toLocaleString() || '2,480'}+ builders • No affiliate spam
              </span>
              <span>Cancel anytime with 1 click</span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ==========================================
  // BANNER / HERO VARIANT (HOMEPAGE & FEATURED SECTIONS)
  // ==========================================
  return (
    <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-indigo-900/50 ${className}`}>
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Copy & Value Proposition */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Weekly AI Tool Directory Dispatch</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {subtitle} Hand-tested by our editorial engineers with latency stats, real benchmarks, and honest pricing disclosures.
          </p>

          {/* Value Bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>5 new AI tools reviewed every Friday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span>Next drop: {stats?.nextEditionDate || 'This Friday'} at 9 AM UTC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span>Zero sponsored filler • 100% independent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>Actionable prompt templates included</span>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="pt-2 flex items-center gap-3 text-xs text-indigo-200/80">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-indigo-900 bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">MK</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-indigo-900 bg-violet-600 text-[10px] font-bold flex items-center justify-center text-white">AC</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-indigo-900 bg-emerald-600 text-[10px] font-bold flex items-center justify-center text-white">SL</span>
              <span className="inline-block h-6 w-6 rounded-full ring-2 ring-indigo-900 bg-amber-600 text-[10px] font-bold flex items-center justify-center text-white">+</span>
            </div>
            <span>
              Trusted by <strong>{stats?.subscriberCount.toLocaleString() || '2,480'}</strong> developers, founders, and knowledge workers.
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Subscription Form & Preferences */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
            {status === 'success' ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    You're Subscribed!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-left text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Email:</span>
                    <strong className="text-white font-mono">{email}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Frequency:</span>
                    <span className="text-indigo-400 capitalize">{frequency} Digest</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Topics:</span>
                    <span className="text-slate-200">
                      {selectedTopics.includes('all') ? 'All AI Categories' : `${selectedTopics.length} selected`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowIssuePreview(!showIssuePreview)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showIssuePreview ? 'Hide Sample Issue' : 'Preview Sample Edition'}</span>
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setEmail('');
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Add another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newsletter-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Work or Personal Email <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      required
                      aria-required="true"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newsletter-name" className="block text-xs font-medium text-slate-400 mb-1">
                    First Name (Optional)
                  </label>
                  <input
                    id="newsletter-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Topic selection accordion toggle */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Curate Your AI Topics:</span>
                    <button
                      type="button"
                      onClick={() => setShowPreferences(!showPreferences)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium cursor-pointer"
                    >
                      {showPreferences ? 'Fewer options' : 'Customize topics'}
                    </button>
                  </div>

                  {showPreferences ? (
                    <div className="mt-2.5 space-y-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_TOPICS.map(topic => {
                          const active = selectedTopics.includes(topic.id);
                          const Icon = topic.icon;
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => toggleTopic(topic.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                active
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{topic.label}</span>
                              {active && <Check className="w-3 h-3 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Frequency:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                          <input
                            type="radio"
                            name="frequency"
                            value="weekly"
                            checked={frequency === 'weekly'}
                            onChange={() => setFrequency('weekly')}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Weekly (Fri)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                          <input
                            type="radio"
                            name="frequency"
                            value="biweekly"
                            checked={frequency === 'biweekly'}
                            onChange={() => setFrequency('biweekly')}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Bi-weekly</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> All Directory Additions
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300">
                        <Calendar className="w-3 h-3 text-indigo-400" /> Weekly (Fridays)
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[46px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Subscription...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Weekly AI Tool Drops</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-xs text-rose-400 font-medium">
                    {message}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Zero spam, SSL encrypted
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowIssuePreview(!showIssuePreview)}
                    className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>See sample issue</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Sample Issue Modal / Preview Drawer */}
      {showIssuePreview && (
        <div className="relative mt-8 p-5 sm:p-6 bg-slate-900 border border-indigo-900/60 rounded-2xl text-slate-100 z-10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold">
                EDITION #42 PREVIEW
              </span>
              <span className="text-xs text-slate-400">
                Friday AI Tool Digest • ClarifyAll Editorial
              </span>
            </div>
            <button
              onClick={() => setShowIssuePreview(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                1. Frontier LLM
              </span>
              <h5 className="font-bold text-sm text-white">Claude 3.5 Sonnet Artifacts 2.0</h5>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Analyzed live React interactive rendering, token efficiency vs GPT-4o, and full workspace export capabilities.
              </p>
              <div className="pt-1 text-[10px] text-indigo-400 font-mono">Benchmark: 93.7% HumanEval</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                2. Free Utility Drop
              </span>
              <h5 className="font-bold text-sm text-white">Gemini 3.8 Flash Prompt Chain Lab</h5>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Zero-cost system prompt builder with reasoning step verification and automatic token compression.
              </p>
              <div className="pt-1 text-[10px] text-emerald-400 font-mono">Status: 100% Free on ClarifyAll</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
                3. Coding Assistant
              </span>
              <h5 className="font-bold text-sm text-white">Cursor IDE AI Background Agent</h5>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Autonomous multi-file refactoring and test-driven fixes evaluated on a 15,000 LOC TypeScript repository.
              </p>
              <div className="pt-1 text-[10px] text-slate-400 font-mono">Pricing: Free tier + $20 Pro</div>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-400 text-center">
            Every issue is concise, markdown-formatted, and takes less than 3 minutes to read.
          </p>
        </div>
      )}
    </section>
  );
};
