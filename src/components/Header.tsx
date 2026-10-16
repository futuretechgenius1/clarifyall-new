import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Type,
  Compass,
  BookOpen,
  User,
  Star,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme, mobileMenuOpen, setMobileMenuOpen, setSearchOpen, user, favorites, bookmarks } = useApp();
  const location = useLocation();

  const navLinks = [
    { label: 'All Tools', href: '/tools' },
    { label: 'Categories', href: '/categories' },
    { label: 'AI Directory', href: '/ai-tools' },
    { label: 'Guides', href: '/guides' },
    { label: 'Blog', href: '/blog' },
  ];

  const categoryShortcuts = [
    { label: 'PDF Tools', href: '/categories/pdf-documents', icon: FileText },
    { label: 'Image Utilities', href: '/categories/image-utilities', icon: ImageIcon },
    { label: 'AI Writing', href: '/categories/ai-writing', icon: Sparkles },
    { label: 'Career Tools', href: '/categories/career-resume', icon: Briefcase },
    { label: 'Text Tools', href: '/categories/text-tools', icon: Type },
    { label: 'AI Directory', href: '/ai-tools', icon: Compass },
    { label: 'Guides & Articles', href: '/guides', icon: BookOpen },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Clarify<span className="text-indigo-600 dark:text-indigo-400">All</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                  Free
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1 hidden xs:block">
                AI. Made Clear.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-colors min-h-[44px] min-w-[44px] justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search tools"
            >
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-11 h-11 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Dashboard / Workspace Link */}
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl transition-all shadow-2xs min-h-[40px]"
                title="My Workspace & Dashboard"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-medium max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                {bookmarks.length > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded-full shadow-2xs"
                    title={`${bookmarks.length} bookmarked AI tools`}
                  >
                    <Bookmark className="w-2.5 h-2.5 fill-white" />
                    {bookmarks.length}
                  </span>
                )}
                {favorites.length > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-full shadow-2xs"
                    title={`${favorites.length} saved utility favorites`}
                  >
                    <Star className="w-2.5 h-2.5 fill-white" />
                    {favorites.length}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs min-h-[40px]"
                title="Sign In to User Workspace"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            )}

            {/* Admin Dashboard Link */}
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        >
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">ClarifyAll</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Main Links */}
              {/* User Workspace Mobile Card */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-indigo-50/90 to-violet-50/90 dark:from-indigo-950/50 dark:to-violet-950/50 border border-indigo-200/70 dark:border-indigo-800/60 rounded-2xl">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                      {user ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {user ? user.name : 'User Workspace'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user ? `${favorites.length} saved tools • Settings` : 'Save favorites & view history'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Open &rarr;
                  </span>
                </Link>
              </div>

              <div className="mt-4 space-y-1">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600"
                >
                  Home
                </Link>
                <Link
                  to="/tools"
                  onClick={closeMenu}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600"
                >
                  All Tools (14 Free Utilities)
                </Link>
              </div>

              {/* Categories Section */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Categories
                </p>
                <div className="space-y-1">
                  {categoryShortcuts.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.href}
                        to={cat.href}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{cat.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <Link
                to="/admin"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span>Admin Dashboard</span>
              </Link>
              <p className="text-center text-[11px] text-slate-400">
                100% Free • No Signup Required
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
