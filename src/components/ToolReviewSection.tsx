import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Filter,
  PlusCircle,
  X,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { ToolReview, ToolReviewStats } from '../types';
import { useApp } from '../context/AppContext';

interface ToolReviewSectionProps {
  toolSlug: string;
  toolName: string;
  onRatingUpdated?: (stats: ToolReviewStats) => void;
}

export const ToolReviewSection: React.FC<ToolReviewSectionProps> = ({
  toolSlug,
  toolName,
  onRatingUpdated,
}) => {
  const { user } = useApp();

  const [reviews, setReviews] = useState<ToolReview[]>([]);
  const [stats, setStats] = useState<ToolReviewStats>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formRating, setFormRating] = useState<number>(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formPros, setFormPros] = useState('');
  const [formCons, setFormCons] = useState('');
  const [formUserName, setFormUserName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filtering & Sorting
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');

  // Track voted reviews locally so user cannot spam thumbs up
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  // Fetch reviews on mount or tool change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/tools/${toolSlug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.data) {
          setReviews(data.data.reviews || []);
          if (data.data.stats) {
            setStats(data.data.stats);
            if (onRatingUpdated) onRatingUpdated(data.data.stats);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError('Unable to load reviews at this moment.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [toolSlug]);

  // Update userName if user logs in
  useEffect(() => {
    if (user?.name && !formUserName) {
      setFormUserName(user.name);
    }
  }, [user]);

  const ratingDescriptions: Record<number, string> = {
    1: '1 - Poor (Did not work as expected)',
    2: '2 - Fair (Needs major improvements)',
    3: '3 - Good (Useful for standard tasks)',
    4: '4 - Very Good (High quality & reliable)',
    5: '5 - Excellent (Essential & fast productivity tool)',
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) return;

    // Optimistically update
    setVotedReviews((prev) => new Set([...prev, reviewId]));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );

    try {
      await fetch(`/api/v1/tools/${toolSlug}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
    } catch {
      // ignore
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (formRating < 1 || formRating > 5) {
      setSubmitError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!formComment.trim() || formComment.trim().length < 5) {
      setSubmitError('Please write at least 5 characters sharing your experience.');
      return;
    }

    setSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('clarify_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }

      const res = await fetch(`/api/v1/tools/${toolSlug}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating: formRating,
          title: formTitle.trim() || undefined,
          comment: formComment.trim(),
          pros: formPros.trim() || undefined,
          cons: formCons.trim() || undefined,
          userName: formUserName.trim() || (user?.name ?? 'Community Member'),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      // Add to list and update stats
      if (data.data?.review) {
        setReviews((prev) => [data.data.review, ...prev]);
      }
      if (data.data?.stats) {
        setStats(data.data.stats);
        if (onRatingUpdated) onRatingUpdated(data.data.stats);
      }

      setSubmitSuccess(true);
      setFormTitle('');
      setFormComment('');
      setFormPros('');
      setFormCons('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and sort reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];

    if (selectedStarFilter !== null) {
      result = result.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      if (sortBy === 'helpful') {
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      }
      return 0;
    });

    return result;
  }, [reviews, selectedStarFilter, sortBy]);

  const activeStarRating = hoverRating !== null ? hoverRating : formRating;

  return (
    <section
      id="reviews-section"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xs"
    >
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Community Ratings & Reviews
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real feedback from creators, developers, and knowledge workers using {toolName}.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setSubmitSuccess(false);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
            showForm
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95'
          }`}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel Review</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Write a Review</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Rating Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/70 dark:bg-slate-800/40 p-5 sm:p-7 rounded-2xl border border-slate-100 dark:border-slate-800">
        {/* Overall Score */}
        <div className="md:col-span-5 flex flex-col justify-center items-center text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Based on{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {stats.totalReviews}
            </span>{' '}
            community {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Genuine User Feedback</span>
          </div>
        </div>

        {/* Breakdown Bars */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage =
              stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            const isSelected = selectedStarFilter === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                className={`w-full group flex items-center gap-3 text-xs text-left p-1 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1 w-12 shrink-0 font-medium">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4
                        ? 'bg-amber-400'
                        : star === 3
                        ? 'bg-amber-300'
                        : 'bg-amber-200 dark:bg-amber-500/50'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-16 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  {percentage}% ({count})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Review Submission Form Modal / Collapse */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-5 sm:p-7 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Share Your Experience with {toolName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Help other makers understand the speed, accuracy, and utility of this tool.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Thank you! Your feedback has been published and added to the aggregate score.</span>
            </div>
          )}

          {/* Interactive Star Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Your Rating (Required)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-hidden"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-7 h-7 cursor-pointer transition-colors ${
                        star <= activeStarRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 pl-2">
                {ratingDescriptions[activeStarRating]}
              </span>
            </div>
          </div>

          {/* Review Title & User Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="review-title"
                className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Headline / One-line Summary
              </label>
              <input
                id="review-title"
                type="text"
                placeholder="e.g. Incredibly fast compression with zero quality loss"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="review-name"
                className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Display Name
              </label>
              <input
                id="review-name"
                type="text"
                placeholder="Your name or handle"
                value={formUserName}
                onChange={(e) => setFormUserName(e.target.value)}
                maxLength={50}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Detailed Feedback Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="review-comment"
                className="text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Detailed Feedback (Required)
              </label>
              <span className="text-[11px] text-slate-400">
                {formComment.length} / 1,000 characters
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              placeholder="What did you use this tool for? How was the accuracy, speed, or output quality compared to other solutions?"
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              maxLength={1000}
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Optional Pros & Cons for richer feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="review-pros"
                className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5"
              >
                Pros / Highlights (Optional)
              </label>
              <input
                id="review-pros"
                type="text"
                placeholder="e.g. Instant client-side processing, crisp UI"
                value={formPros}
                onChange={(e) => setFormPros(e.target.value)}
                maxLength={150}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="review-cons"
                className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5"
              >
                Things to Improve (Optional)
              </label>
              <input
                id="review-cons"
                type="text"
                placeholder="e.g. Would love bulk zip upload in future"
                value={formCons}
                onChange={(e) => setFormCons(e.target.value)}
                maxLength={150}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. Filter & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Star Rating Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedStarFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedStarFilter === null
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((s) => {
            const count = stats.distribution[s as 1 | 2 | 3 | 4 | 5] || 0;
            const isSelected = selectedStarFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStarFilter(isSelected ? null : s)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{s}</span>
                <Star
                  className={`w-3 h-3 ${
                    isSelected ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'
                  }`}
                />
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-reviews" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort-reviews"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 5. Reviews List */}
      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading verified feedback...</p>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {selectedStarFilter
              ? `No ${selectedStarFilter}-star reviews found`
              : 'Be the first to review this tool!'}
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {selectedStarFilter
              ? 'Try selecting a different star filter above or clear the filter.'
              : 'Share your feedback and thoughts to help the community.'}
          </p>
          {selectedStarFilter ? (
            <button
              onClick={() => setSelectedStarFilter(null)}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear Filter
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Write First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((rev) => {
            const hasVoted = votedReviews.has(rev.id);
            const userInitial = rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U';
            const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <article
                key={rev.id}
                className="p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {userInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {rev.userName}
                        </span>
                        {rev.verifiedUser && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                            <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                            <span>Verified User</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{formattedDate}</span>
                    </div>
                  </div>

                  {/* Stars badge */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 shrink-0 shadow-2xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                {rev.title && (
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {rev.title}
                  </h4>
                )}

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>

                {/* Pros and Cons Badges if available */}
                {(rev.pros || rev.cons) && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    {rev.pros && (
                      <div className="flex-1 p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl text-xs">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                          ✓ What worked well:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{rev.pros}</span>
                      </div>
                    )}
                    {rev.cons && (
                      <div className="flex-1 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs">
                        <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                          △ Suggestions / Limitations:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{rev.cons}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer with Helpful Vote */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Was this feedback helpful?</span>
                  <button
                    type="button"
                    onClick={() => handleHelpfulVote(rev.id)}
                    disabled={hasVoted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                      hasVoted
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${hasVoted ? 'fill-indigo-500 text-indigo-500' : ''}`}
                    />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
