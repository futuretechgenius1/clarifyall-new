import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Check,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Edit3,
  Trash2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { AiToolItem } from '../types';
import { useApp } from '../context/AppContext';

interface AiToolCardProps {
  item: AiToolItem;
  showNotes?: boolean;
  notes?: string;
  onEditNotes?: (slug: string, currentNotes: string) => void;
  onRemove?: (slug: string) => void;
  compact?: boolean;
}

export const AiToolCard: React.FC<AiToolCardProps> = ({
  item,
  showNotes = false,
  notes,
  onEditNotes,
  onRemove,
  compact = false,
}) => {
  const { isBookmarked, toggleBookmark } = useApp();
  const bookmarked = isBookmarked(item.slug);
  const [justToggled, setJustToggled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark(item.slug);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 2000);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/ai-tools/${item.slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 border ${
        bookmarked
          ? 'border-indigo-300 dark:border-indigo-700/80 shadow-sm'
          : 'border-slate-200 dark:border-slate-800'
      } rounded-2xl flex flex-col justify-between p-6 transition-all duration-200 hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500`}
    >
      {/* Top Bar: Title, Pricing, & Action Buttons */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {item.pricingModel}
              </span>
              {item.categories && item.categories.length > 0 && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {item.categories[0]}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Link to={`/ai-tools/${item.slug}`} className="hover:underline focus:outline-none">
                {item.name}
              </Link>
            </h3>
          </div>

          {/* Action buttons: Bookmark toggle + Share */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShareClick}
              title={copiedLink ? 'Link copied!' : 'Share AI tool link'}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Share tool"
            >
              {copiedLink ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* DIRECT BOOKMARK TOGGLE BUTTON */}
            <button
              onClick={handleBookmarkClick}
              title={bookmarked ? 'Saved to Bookmarks (Click to remove)' : 'Save to Bookmarks'}
              className={`p-2 rounded-xl transition-all min-h-[38px] min-w-[38px] flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                bookmarked
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs'
                  : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
              aria-label={bookmarked ? `Remove ${item.name} from bookmarks` : `Bookmark ${item.name}`}
            >
              <Bookmark
                className={`w-4 h-4 transition-transform ${
                  bookmarked
                    ? 'fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400 scale-105'
                    : 'text-current'
                }`}
              />
              <span className="hidden sm:inline text-[11px]">
                {bookmarked ? 'Saved' : 'Bookmark'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Toggled Toast Indicator */}
        {justToggled && (
          <div className="mb-2 py-1 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              {bookmarked ? 'Added to your Dashboard Bookmarks' : 'Removed from Bookmarks'}
            </span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-3">
          {item.description}
        </p>

        {/* Category tags */}
        {item.categories && item.categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.categories.slice(0, 3).map((cat, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Features & Limitations (hidden in compact view) */}
        {!compact && (
          <div className="space-y-3 mb-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Key Strengths
              </span>
              <ul className="space-y-1">
                {item.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {item.limitations && item.limitations.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Limitations to Note
                </span>
                <ul className="space-y-1">
                  {item.limitations.slice(0, 2).map((l, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                      <X className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="line-clamp-1">{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Optional Personal Note Box (Dashboard Management) */}
        {showNotes && (
          <div className="mt-3 p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl mb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Personal Note / Use Case
              </span>
              {onEditNotes && (
                <button
                  onClick={() => onEditNotes(item.slug, notes || '')}
                  className="text-[11px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-0.5"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{notes ? 'Edit' : 'Add Note'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200/90 italic">
              {notes || 'No note added yet. Click edit to record your preferred prompt or workflow memo.'}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Navigation & External Links */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-3">
        <Link
          to={`/ai-tools/${item.slug}`}
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 p-1 group/btn"
        >
          <span>Editorial Review</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-3">
          {onRemove && (
            <button
              onClick={() => onRemove(item.slug)}
              title="Remove from bookmarks"
              className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Remove</span>
            </button>
          )}

          <a
            href={item.vendorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 p-1 font-medium"
          >
            <span>Visit Vendor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
