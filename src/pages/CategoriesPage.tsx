import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryCard } from '../components/CategoryCard';
import { Category, Tool } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    fetch('/api/v1/categories')
      .then(res => res.json())
      .then(data => data.success && setCategories(data.data));

    fetch('/api/v1/tools')
      .then(res => res.json())
      .then(data => data.success && setTools(data.data));
  }, []);

  return (
    <div className="space-y-8">
      <SEOHead
        title="Browse Utility Categories | ClarifyAll"
        description="Explore free online tool categories: PDF documents, image utilities, AI writing assistants, text manipulation, and resume tools."
        canonical="https://clarifyall.com/categories"
      />

      <Breadcrumbs items={[{ label: 'Categories' }]} />

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Utility Categories
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Curated collections of single-purpose productivity tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => {
          const count = tools.filter(t => t.categoryId === cat.id).length;
          return <CategoryCard key={cat.id} category={cat} toolCount={count} />;
        })}
      </div>
    </div>
  );
};
