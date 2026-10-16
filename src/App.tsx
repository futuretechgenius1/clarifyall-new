import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { AIToolsPage } from './pages/AIToolsPage';
import { AIToolDetailPage } from './pages/AIToolDetailPage';
import { AIToolComparePage } from './pages/AIToolComparePage';
import { PromptsPage } from './pages/PromptsPage';
import { GuidesPage } from './pages/GuidesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { BlogPage } from './pages/BlogPage';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import {
  PrivacyPolicyPage,
  TermsPage,
  CookiePolicyPage,
  EditorialPolicyPage,
  AdvertisingPolicyPage,
} from './pages/PolicyPages';
import {
  AboutPage,
  ContactPage,
  NotFoundPage,
  ServerErrorPage,
} from './pages/MiscPages';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          <Header />
          <SearchModal />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <Routes>
              {/* Main Landing & Directory Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/:slug" element={<ToolDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<CategoryDetailPage />} />
              
              {/* AI Tool Directory & Comparison */}
              <Route path="/ai-tools" element={<AIToolsPage />} />
              <Route path="/ai-tools/:slug" element={<AIToolDetailPage />} />
              <Route path="/ai-tools/compare/:slug" element={<AIToolComparePage />} />
              
              {/* Prompts & Learning */}
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="/prompts/:slug" element={<PromptsPage />} />
              
              {/* Content, Guides & Blog */}
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/guides/:slug" element={<ArticleDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<ArticleDetailPage />} />
              
              {/* Search */}
              <Route path="/search" element={<SearchPage />} />
              
              {/* Institutional & Legal Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
              <Route path="/advertising-policy" element={<AdvertisingPolicyPage />} />
              
              {/* User Dashboard & Workspace */}
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/workspace" element={<UserDashboardPage />} />
              <Route path="/account" element={<UserDashboardPage />} />

              {/* Administrative Control Center */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              
              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
