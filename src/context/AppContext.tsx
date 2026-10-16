import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../../server/middleware/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserPreferences {
  defaultTheme: 'light' | 'dark';
  emailNotifications: boolean;
  anonymousTelemetry: boolean;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  adminRole: UserRole;
  setAdminRole: (role: UserRole) => void;
  adminKey: string;
  setAdminKey: (key: string) => void;
  adsEnabled: boolean;
  setAdsEnabled: (enabled: boolean) => void;

  // User Auth & Dashboard State
  user: UserProfile | null;
  token: string | null;
  favorites: string[];
  bookmarks: string[];
  bookmarkNotes: Record<string, string>;
  preferences: UserPreferences;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleFavorite: (toolSlug: string) => Promise<boolean>;
  isFavorite: (toolSlug: string) => boolean;
  toggleBookmark: (toolSlug: string, notes?: string) => Promise<boolean>;
  isBookmarked: (toolSlug: string) => boolean;
  removeBookmark: (toolSlug: string) => Promise<boolean>;
  updateBookmarkNotes: (toolSlug: string, notes: string) => Promise<boolean>;
  updatePreferences: (prefs: Partial<UserPreferences>, newName?: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('clarify_theme') as 'light' | 'dark') || 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<UserRole>('SUPER_ADMIN');
  const [adminKey, setAdminKey] = useState<string>(() => {
    return localStorage.getItem('clarify_admin_key') || 'clarifyall_secure_admin_key_2026';
  });
  const [adsEnabled, setAdsEnabled] = useState(false);

  // User State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('clarify_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('clarify_token') || null;
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('clarify_favorites');
    return saved ? JSON.parse(saved) : ['pdf-compressor', 'ai-email-writer'];
  });
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('clarify_ai_bookmarks');
    return saved ? JSON.parse(saved) : ['claude-3-5-sonnet', 'perplexity-ai', 'chatgpt'];
  });
  const [bookmarkNotes, setBookmarkNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('clarify_bookmark_notes');
    return saved
      ? JSON.parse(saved)
      : {
          'claude-3-5-sonnet': 'Best for complex coding refactoring & prompt architecture',
          'perplexity-ai': 'Primary research engine for citation-backed analysis',
          'chatgpt': 'General productivity and canvas document drafting',
        };
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultTheme: 'light',
    emailNotifications: true,
    anonymousTelemetry: true,
  });

  useEffect(() => {
    localStorage.setItem('clarify_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync favorites, bookmarks and dashboard if user is signed in
  useEffect(() => {
    if (user && token) {
      fetch('/api/v1/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            if (data.data.favoriteSlugs) {
              setFavorites(data.data.favoriteSlugs);
              localStorage.setItem('clarify_favorites', JSON.stringify(data.data.favoriteSlugs));
            }
            if (data.data.bookmarkedAiSlugs) {
              setBookmarks(data.data.bookmarkedAiSlugs);
              localStorage.setItem('clarify_ai_bookmarks', JSON.stringify(data.data.bookmarkedAiSlugs));
            }
            if (data.data.bookmarkNotes) {
              setBookmarkNotes(data.data.bookmarkNotes);
              localStorage.setItem('clarify_bookmark_notes', JSON.stringify(data.data.bookmarkNotes));
            }
            if (data.data.preferences) {
              setPreferences(data.data.preferences);
            }
          }
        })
        .catch(console.error);
    }
  }, [user?.id, token]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginDemo = async () => {
    try {
      const res = await fetch('/api/v1/auth/demo', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('clarify_user', JSON.stringify(data.data.user));
        localStorage.setItem('clarify_token', data.data.token);
      }
    } catch (e) {
      console.error('Demo login error:', e);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('clarify_user', JSON.stringify(data.data.user));
        localStorage.setItem('clarify_token', data.data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to sign in.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('clarify_user', JSON.stringify(data.data.user));
        localStorage.setItem('clarify_token', data.data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('clarify_user');
    localStorage.removeItem('clarify_token');
  };

  const toggleFavorite = async (toolSlug: string): Promise<boolean> => {
    let nextState: boolean;
    if (favorites.includes(toolSlug)) {
      setFavorites(prev => prev.filter(s => s !== toolSlug));
      nextState = false;
    } else {
      setFavorites(prev => [...prev, toolSlug]);
      nextState = true;
    }

    localStorage.setItem(
      'clarify_favorites',
      JSON.stringify(nextState ? [...favorites, toolSlug] : favorites.filter(s => s !== toolSlug))
    );

    // If logged in, sync with server/MySQL
    if (user && token) {
      try {
        await fetch('/api/v1/user/favorites/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id,
          },
          body: JSON.stringify({ toolSlug }),
        });
      } catch (e) {
        console.error('Failed to sync favorite with server:', e);
      }
    }

    return nextState;
  };

  const isFavorite = (toolSlug: string) => favorites.includes(toolSlug);

  const toggleBookmark = async (toolSlug: string, notes?: string): Promise<boolean> => {
    let nextState: boolean;
    if (bookmarks.includes(toolSlug)) {
      setBookmarks(prev => prev.filter(s => s !== toolSlug));
      nextState = false;
    } else {
      setBookmarks(prev => [toolSlug, ...prev]);
      nextState = true;
    }

    if (notes !== undefined) {
      setBookmarkNotes(prev => ({
        ...prev,
        [toolSlug]: notes,
      }));
      const updatedNotes = { ...bookmarkNotes, [toolSlug]: notes };
      localStorage.setItem('clarify_bookmark_notes', JSON.stringify(updatedNotes));
    }

    localStorage.setItem(
      'clarify_ai_bookmarks',
      JSON.stringify(nextState ? [toolSlug, ...bookmarks.filter(s => s !== toolSlug)] : bookmarks.filter(s => s !== toolSlug))
    );

    // If logged in, sync with server/MySQL
    if (user && token) {
      try {
        await fetch('/api/v1/user/bookmarks/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id,
          },
          body: JSON.stringify({ toolSlug, notes }),
        });
      } catch (e) {
        console.error('Failed to sync bookmark with server:', e);
      }
    }

    return nextState;
  };

  const isBookmarked = (toolSlug: string) => bookmarks.includes(toolSlug);

  const removeBookmark = async (toolSlug: string): Promise<boolean> => {
    setBookmarks(prev => prev.filter(s => s !== toolSlug));
    const nextList = bookmarks.filter(s => s !== toolSlug);
    localStorage.setItem('clarify_ai_bookmarks', JSON.stringify(nextList));

    if (user && token) {
      try {
        await fetch(`/api/v1/user/bookmarks/${toolSlug}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id,
          },
        });
      } catch (e) {
        console.error('Failed to delete bookmark on server:', e);
      }
    }
    return true;
  };

  const updateBookmarkNotes = async (toolSlug: string, notes: string): Promise<boolean> => {
    setBookmarkNotes(prev => ({
      ...prev,
      [toolSlug]: notes,
    }));
    const updatedNotes = { ...bookmarkNotes, [toolSlug]: notes };
    localStorage.setItem('clarify_bookmark_notes', JSON.stringify(updatedNotes));

    if (user && token) {
      try {
        await fetch(`/api/v1/user/bookmarks/${toolSlug}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id,
          },
          body: JSON.stringify({ notes }),
        });
        return true;
      } catch (e) {
        console.error('Failed to update bookmark notes:', e);
        return false;
      }
    }
    return true;
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>, newName?: string) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    if (newName && user) {
      setUser({ ...user, name: newName });
      localStorage.setItem('clarify_user', JSON.stringify({ ...user, name: newName }));
    }

    if (user && token) {
      try {
        await fetch('/api/v1/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id,
          },
          body: JSON.stringify({ name: newName, preferences: updated }),
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchOpen,
        setSearchOpen,
        adminRole,
        setAdminRole,
        adminKey,
        setAdminKey,
        adsEnabled,
        setAdsEnabled,
        user,
        token,
        favorites,
        bookmarks,
        bookmarkNotes,
        preferences,
        login,
        loginDemo,
        register,
        logout,
        toggleFavorite,
        isFavorite,
        toggleBookmark,
        isBookmarked,
        removeBookmark,
        updateBookmarkNotes,
        updatePreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
