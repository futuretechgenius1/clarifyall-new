import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Article } from '../types';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/v1/articles?type=blog')
      .then(res => res.json())
      .then(data => data.success && setPosts(data.data));
  }, []);

  return (
    <div className="space-y-8">
      <SEOHead
        title="ClarifyAll Editorial Blog – Technology, AI & Productivity"
        description="Insights, benchmarks, and perspectives on image compression algorithms, artificial intelligence workflows, and web performance."
        canonical="https://clarifyall.com/blog"
      />

      <Breadcrumbs items={[{ label: 'Blog' }]} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ClarifyAll Editorial Blog
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Analysis, benchmark studies, and updates from the ClarifyAll engineering team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all group"
          >
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span>By {post.authorName}</span>
                <span>•</span>
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Read Full Article</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
