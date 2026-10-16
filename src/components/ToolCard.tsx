import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Tool } from '../types';
import { useApp } from '../context/AppContext';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { isFavorite, toggleFavorite } = useApp();
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;
  const favorited = isFavorite(tool.slug);

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool.slug);
  };

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group relative flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-[160px]"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div className="flex items-center gap-1.5">
            {tool.isFeatured && (
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                Popular
              </span>
            )}
            <button
              onClick={handleStarClick}
              title={favorited ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
                favorited
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label={favorited ? 'Unfavorite tool' : 'Favorite tool'}
            >
              <Icons.Star className={`w-4 h-4 ${favorited ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {tool.name}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
        <span>Open Utility</span>
        <Icons.ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
