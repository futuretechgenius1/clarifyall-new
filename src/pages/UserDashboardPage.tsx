import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Star,
  History,
  Settings,
  LogOut,
  Sparkles,
  Wrench,
  Clock,
  Shield,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Sun,
  Moon,
  Bell,
  EyeOff,
  Search,
  KeyRound,
  Download,
  Database,
  RefreshCw,
  Bookmark,
  Edit3,
  Filter,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ToolCard } from '../components/ToolCard';
import { AiToolCard } from '../components/AiToolCard';
import { useApp } from '../context/AppContext';
import { Tool, AiToolItem } from '../types';

export const UserDashboardPage: React.FC = () => {
  const {
    user,
    token,
    logout,
    login,
    register,
    loginDemo,
    favorites,
    toggleFavorite,
    bookmarks,
    bookmarkNotes,
    toggleBookmark,
    removeBookmark,
    updateBookmarkNotes,
    preferences,
    updatePreferences,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'favorites' | 'history' | 'settings' | 'security'>('bookmarks');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AI Tools directory cache
  const [allAiTools, setAllAiTools] = useState<AiToolItem[]>([]);

  // Search & filter state
  const [bmSearchQuery, setBmSearchQuery] = useState('');
  const [bmCategoryFilter, setBmCategoryFilter] = useState('All');
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const [histSearchQuery, setHistSearchQuery] = useState('');

  // Personal Note Editor State
  const [editingNoteSlug, setEditingNoteSlug] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Settings form state
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [prefTheme, setPrefTheme] = useState<'light' | 'dark'>(preferences.defaultTheme || 'light');
  const [emailNotifs, setEmailNotifs] = useState(preferences.emailNotifications !== false);
  const [anonTelemetry, setAnonTelemetry] = useState(preferences.anonymousTelemetry !== false);

  // Security & Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Auth form state for signed-out view
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const fetchDashboard = () => {
    if (!user || !token) return;
    setLoading(true);
    fetch('/api/v1/user/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-user-id': user.id,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDashboardData(data.data);
          if (data.data.user?.name) setDisplayName(data.data.user.name);
          if (data.data.preferences) {
            setPrefTheme(data.data.preferences.defaultTheme || 'light');
            setEmailNotifs(data.data.preferences.emailNotifications !== false);
            setAnonTelemetry(data.data.preferences.anonymousTelemetry !== false);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/v1/ai-tools')
      .then(res => res.json())
      .then(data => data.success && setAllAiTools(data.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchDashboard();
    }
  }, [user?.id, token, favorites.length, bookmarks.length]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    if (authMode === 'login') {
      const res = await login(authEmail, authPass);
      if (!res.success) {
        setAuthError(res.error || 'Failed to sign in.');
      }
    } else {
      const res = await register(authName, authEmail, authPass);
      if (!res.success) {
        setAuthError(res.error || 'Failed to register.');
      }
    }
    setAuthSubmitting(false);
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updatePreferences(
      {
        defaultTheme: prefTheme,
        emailNotifications: emailNotifs,
        anonymousTelemetry: anonTelemetry,
      },
      displayName
    );

    if (ok) {
      setStatusMsg({ text: 'Personal settings updated and synced to database.', type: 'success' });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ text: 'Failed to update preferences.', type: 'error' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusMsg({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setPasswordUpdating(true);
    try {
      const res = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPassword('');
        setConfirmPassword('');
        setStatusMsg({ text: 'Security credentials updated successfully in Hostinger MySQL.', type: 'success' });
        setTimeout(() => setStatusMsg(null), 3500);
      } else {
        setStatusMsg({ text: data.error || 'Failed to update password.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Network error updating password.', type: 'error' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your personal usage history from the database?')) return;
    try {
      const res = await fetch('/api/v1/user/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user?.id || '',
        },
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: 'Usage history cleared successfully.', type: 'success' });
        fetchDashboard();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Failed to clear history.', type: 'error' });
    }
  };

  const handleExportData = () => {
    const exportObject = {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      exportedAt: new Date().toISOString(),
      database: {
        host: 'srv1148.hstgr.io',
        databaseName: 'u530425252_clarifyall',
      },
      savedFavorites: dashboardData?.favoriteSlugs || favorites,
      favoriteTools: dashboardData?.favoriteTools || [],
      savedAiBookmarks: bookmarks,
      bookmarkedAiTools: rawBookmarkedAiTools,
      bookmarkNotes: bookmarkNotes,
      usageHistory: dashboardData?.usageHistory || [],
      preferences: preferences,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarifyall_backup_${user?.id || 'workspace'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Workspace export downloaded as JSON.', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleOpenEditNote = (slug: string, currentNotes: string) => {
    setEditingNoteSlug(slug);
    setEditingNoteText(currentNotes || '');
  };

  const handleSaveNote = async () => {
    if (!editingNoteSlug) return;
    setSavingNote(true);
    await updateBookmarkNotes(editingNoteSlug, editingNoteText);
    setSavingNote(false);
    setEditingNoteSlug(null);
    setStatusMsg({ text: 'Personal note updated and saved.', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleRemoveBookmark = async (slug: string) => {
    await removeBookmark(slug);
    setStatusMsg({ text: 'AI tool removed from bookmarks.', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleClearAllBookmarks = async () => {
    if (!window.confirm('Are you sure you want to clear all your saved AI tool bookmarks?')) return;
    for (const slug of [...bookmarks]) {
      await removeBookmark(slug);
    }
    setStatusMsg({ text: 'All bookmarks cleared.', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExportBookmarks = () => {
    const exportData = {
      user: user?.email,
      exportedAt: new Date().toISOString(),
      totalBookmarks: bookmarks.length,
      bookmarks: rawBookmarkedAiTools.map(t => ({
        name: t.name,
        slug: t.slug,
        vendorUrl: t.vendorUrl,
        pricingModel: t.pricingModel,
        categories: t.categories,
        personalNotes: bookmarkNotes[t.slug] || '',
        reviewUrl: `https://clarifyall.com/ai-tools/${t.slug}`,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarifyall_ai_bookmarks_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Bookmarked AI tools exported as JSON.', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // If user is not logged in, render the sleek Authentication portal
  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-6">
        <SEOHead
          title="Sign In to Your Workspace | ClarifyAll"
          description="Access your saved favorite tools, review personal execution history, and customize productivity preferences."
        />

        <Breadcrumbs items={[{ label: 'User Workspace' }]} />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {authMode === 'login' ? 'Sign In to ClarifyAll' : 'Create Your Workspace'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Save your favorite utilities across devices, review usage history, and customize tool settings.
            </p>
          </div>

          {/* 1-Click Demo Login */}
          <button
            onClick={() => loginDemo()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/50 dark:hover:to-violet-900/50 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 text-xs sm:text-sm transition-all shadow-2xs min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Instant Demo Access (1-Click)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium absolute">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={authPass}
                onChange={e => setAuthPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors min-h-[44px]"
            >
              {authSubmitting
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In to Workspace'
                : 'Create Free Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {authMode === 'login'
                ? "Don't have an account? Create one for free"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bookmarked AI Tools computations
  const rawBookmarkedAiTools: AiToolItem[] = useMemo(() => {
    if (allAiTools.length > 0) {
      return allAiTools.filter(t => bookmarks.includes(t.slug));
    }
    return dashboardData?.bookmarkedAiTools || [];
  }, [allAiTools, bookmarks, dashboardData?.bookmarkedAiTools]);

  const bookmarkedCategories = useMemo(() => {
    const set = new Set<string>();
    rawBookmarkedAiTools.forEach(t => {
      t.categories?.forEach(c => set.add(c));
    });
    return ['All', ...Array.from(set)];
  }, [rawBookmarkedAiTools]);

  const filteredBookmarkedTools = useMemo(() => {
    return rawBookmarkedAiTools.filter(t => {
      if (bmCategoryFilter !== 'All' && !t.categories?.includes(bmCategoryFilter)) {
        return false;
      }
      if (bmSearchQuery.trim()) {
        const q = bmSearchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchCat = t.categories?.some(c => c.toLowerCase().includes(q));
        const matchNote = (bookmarkNotes[t.slug] || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat && !matchNote) return false;
      }
      return true;
    });
  }, [rawBookmarkedAiTools, bmCategoryFilter, bmSearchQuery, bookmarkNotes]);

  const rawFavoriteTools: Tool[] = dashboardData?.favoriteTools || [];
  const rawHistoryItems: any[] = dashboardData?.usageHistory || [];

  // Filtered favorites
  const filteredFavorites = rawFavoriteTools.filter(t =>
    t.name.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(favSearchQuery.toLowerCase())
  );

  // Filtered history
  const filteredHistory = rawHistoryItems.filter(h =>
    (h.tool_slug || '').toLowerCase().includes(histSearchQuery.toLowerCase()) ||
    (h.operation || '').toLowerCase().includes(histSearchQuery.toLowerCase()) ||
    (h.status || '').toLowerCase().includes(histSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SEOHead
        title="Personal Workspace & Dashboard | ClarifyAll"
        description="Manage your favorite tools, view real-time processing logs, and control your personal account settings."
      />

      <Breadcrumbs items={[{ label: 'Workspace Dashboard' }]} />

      {/* User Welcome Profile Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                {user.role || 'MEMBER'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{user.email}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hostinger MySQL 8
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
          <button
            onClick={fetchDashboard}
            title="Refresh workspace telemetry"
            className="p-2.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[40px] flex items-center gap-1 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportData}
            title="Export personal data as JSON"
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export Backup</span>
          </button>
          <Link
            to="/tools"
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 border border-indigo-200/60 dark:border-indigo-800/60"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explore Tools</span>
          </Link>
          <button
            onClick={logout}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab('bookmarks')}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer transition-all shadow-2xs ${
            activeTab === 'bookmarks'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">AI Bookmarks</span>
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/30" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {bookmarks.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Curated AI models</p>
        </div>

        <div
          onClick={() => setActiveTab('favorites')}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer transition-all shadow-2xs ${
            activeTab === 'favorites'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Favorite Utilities</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {favorites.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Quick-launch pinned</p>
        </div>

        <div
          onClick={() => setActiveTab('history')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">History Log</span>
            <History className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {rawHistoryItems.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Logged operations</p>
        </div>

        <div
          onClick={() => setActiveTab('settings')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Theme</span>
            {preferences.defaultTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white capitalize">
            {preferences.defaultTheme || 'light'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Preference saved</p>
        </div>

        <div
          onClick={() => setActiveTab('security')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Hostinger DB</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span>Online</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">MySQL 8 • srv1148</p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 min-h-[42px] ${
            activeTab === 'bookmarks'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-white' : ''}`} />
          <span>Bookmarked AI Tools ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 min-h-[42px] ${
            activeTab === 'favorites'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Saved Utilities ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 min-h-[42px] ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Usage History ({rawHistoryItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 min-h-[42px] ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Personal Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 min-h-[42px] ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security &amp; Password</span>
        </button>
      </div>

      {/* TAB 0: BOOKMARKED AI TOOLS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  AI Directory Bookmarks
                </span>
                <span className="text-xs text-slate-400">
                  {rawBookmarkedAiTools.length} {rawBookmarkedAiTools.length === 1 ? 'tool saved' : 'tools saved'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Your Bookmarked AI Tools
              </h2>
              <p className="text-xs text-slate-500">
                Curate your frontier AI models, code assistants, and productivity engines. Manage notes, test features, or remove anytime.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {rawBookmarkedAiTools.length > 0 && (
                <>
                  <button
                    onClick={handleExportBookmarks}
                    title="Export your AI tool bookmarks to JSON"
                    className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors min-h-[38px] flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleClearAllBookmarks}
                    title="Remove all AI tool bookmarks"
                    className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors min-h-[38px] flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </>
              )}
              <Link
                to="/ai-tools"
                className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors min-h-[38px] flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore AI Directory</span>
              </Link>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          {rawBookmarkedAiTools.length > 0 && (
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search bookmarked tools or personal notes..."
                    value={bmSearchQuery}
                    onChange={e => setBmSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {bmSearchQuery && (
                    <button
                      onClick={() => setBmSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {bookmarkedCategories.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Filter:
                    </span>
                    {bookmarkedCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setBmCategoryFilter(cat)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                          bmCategoryFilter === cat
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookmarked Cards Grid */}
          {filteredBookmarkedTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBookmarkedTools.map(item => (
                <AiToolCard
                  key={item.id}
                  item={item}
                  showNotes={true}
                  notes={bookmarkNotes[item.slug]}
                  onEditNotes={handleOpenEditNote}
                  onRemove={handleRemoveBookmark}
                />
              ))}
            </div>
          ) : rawBookmarkedAiTools.length > 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <p className="text-xs text-slate-500">No bookmarked tools match "{bmSearchQuery}".</p>
              <button
                onClick={() => {
                  setBmSearchQuery('');
                  setBmCategoryFilter('All');
                }}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="py-12 px-6 sm:px-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No AI tools bookmarked yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Toggle the bookmark icon on any AI tool card to save it here for quick reference, vendor access, and custom notes.
                </p>
              </div>

              {/* Quick Recommendations with 1-click Bookmark */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 max-w-xl mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Quick-Save Popular Frontier Models
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { slug: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Anthropic Coding & Writing' },
                    { slug: 'chatgpt', name: 'ChatGPT', desc: 'OpenAI GPT-4o Canvas' },
                    { slug: 'perplexity-ai', name: 'Perplexity AI', desc: 'Cited Live Research' },
                  ].map(rec => (
                    <div
                      key={rec.slug}
                      className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-left flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {rec.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{rec.desc}</div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(rec.slug)}
                        className="mt-2.5 w-full py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1 transition-colors"
                      >
                        <Bookmark className="w-3 h-3 fill-white" />
                        <span>Bookmark</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/ai-tools"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white dark:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Browse Full AI Directory</span>
                </Link>
              </div>
            </div>
          )}

          {/* Edit Note Modal Dialog */}
          {editingNoteSlug && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scaleIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Personal Note & Use Case
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingNoteSlug(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Record workflow reminders, preferred prompt styles, or internal use-cases for this tool.
                </p>

                <textarea
                  value={editingNoteText}
                  onChange={e => setEditingNoteText(e.target.value)}
                  placeholder="e.g. Best for writing unit tests and refactoring Python classes; prompt with system persona 'Senior Architect'..."
                  rows={4}
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingNoteSlug(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SAVED FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Your Saved Favorite Tools
              </h2>
              <p className="text-xs text-slate-500">
                Starred utilities are pinned here for quick 1-click access anytime you return.
              </p>
            </div>

            {rawFavoriteTools.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter saved tools..."
                  value={favSearchQuery}
                  onChange={e => setFavSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavorites.map(t => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          ) : rawFavoriteTools.length > 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <p className="text-xs text-slate-500">No saved tools match "{favSearchQuery}".</p>
              <button
                onClick={() => setFavSearchQuery('')}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No favorite utilities saved yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Browse our directory of 14 utilities and click the star icon on any tool card to bookmark it here.
              </p>
              <Link
                to="/tools"
                className="inline-block mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Browse All Utilities
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USAGE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Processing History
              </h2>
              <p className="text-xs text-slate-500">
                Telemetry of recent operations run across your ClarifyAll workspace.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {rawHistoryItems.length > 0 && (
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={histSearchQuery}
                    onChange={e => setHistSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {rawHistoryItems.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear History</span>
                </button>
              )}
            </div>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-lg">Utility</th>
                    <th className="p-3">Operation</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-lg">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        <Link
                          to={`/tools/${item.tool_slug}`}
                          className="hover:text-indigo-600 flex items-center gap-1"
                        >
                          <span>{item.tool_slug}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {item.operation}
                      </td>
                      <td className="p-3 text-slate-500">
                        {item.processing_duration_ms} ms
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'SUCCESS'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : rawHistoryItems.length > 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No history matches your filter criteria.
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No processing history recorded yet. Run a PDF compression, image converter, or AI tool to see operations logged here.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSavePreferences}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Personal Workspace Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how utilities execute and behave across your sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Preferences &amp; Privacy Controls
            </h3>

            {/* Theme Preference */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Default Theme</p>
                  <p className="text-xs text-slate-500">Select your preferred default interface theme</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrefTheme('light')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    prefTheme === 'light'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPrefTheme('dark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    prefTheme === 'dark'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Tool Update Alerts</p>
                  <p className="text-xs text-slate-500">Receive periodic notices when new utilities are published</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={e => setEmailNotifs(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            {/* Anonymous Telemetry */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Anonymous Processing Stats</p>
                  <p className="text-xs text-slate-500">Log anonymous durations without recording personal text or files</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonTelemetry}
                  onChange={e => setAnonTelemetry(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors min-h-[44px]"
            >
              Save Preferences
            </button>
            <span className="text-xs text-slate-400">
              Saved to MySQL table: <code className="font-mono">user_preferences</code>
            </span>
          </div>
        </form>
      )}

      {/* TAB 4: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form
            onSubmit={handleUpdatePassword}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <span>Security &amp; Password Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your account password stored securely on Hostinger MySQL.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordUpdating || !newPassword}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors min-h-[44px]"
            >
              {passwordUpdating ? 'Updating Password...' : 'Update Account Password'}
            </button>
          </form>

          {/* Infrastructure Security Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Workspace Infrastructure &amp; Encryption</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Database Cluster</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  srv1148.hstgr.io (Port 3306)
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Database Schema</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  u530425252_clarifyall
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Session Authentication</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Active Bearer Token ({token ? token.substring(0, 16) + '...' : 'Guest'})
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Zero Retention File Policy</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Processed in memory; no uploads stored
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserDashboardPage;
