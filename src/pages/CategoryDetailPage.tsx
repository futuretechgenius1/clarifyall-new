import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ToolCard } from '../components/ToolCard';
import { Category, Tool } from '../types';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<(Category & { tools?: Tool[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/categories/${slug}`)
      .then(res => res.json())
      .then(data => data.success && setCategory(data.data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Icons.Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Category Not Found</h1>
        <Link to="/categories" className="mt-4 inline-block text-indigo-600 text-sm">
          Browse Categories
        </Link>
      </div>
    );
  }

  const IconComponent = (Icons as any)[category.icon] || Icons.Folder;

  return (
    <div className="space-y-8">
      <SEOHead
        title={category.seoTitle || `${category.name} Tools & Utilities | ClarifyAll`}
        description={category.seoDescription || category.description}
        canonical={`https://clarifyall.com/categories/${category.slug}`}
      />

      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {category.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {category.tools && category.tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};
