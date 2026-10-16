import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Wrench,
  BookOpen,
  Compass,
  Settings,
  Megaphone,
  Activity,
  History,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Save,
  Lock,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../server/middleware/auth';
import { Tool, Article, AiToolItem, AdSlotConfig } from '../types';

export const AdminPage: React.FC = () => {
  const { adminRole, setAdminRole, adminKey, setAdminKey, adsEnabled, setAdsEnabled } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tools' | 'articles' | 'ai-tools' | 'ad-slots' | 'settings' | 'ai-usage' | 'audit'
  >('overview');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [toolsList, setToolsList] = useState<Tool[]>([]);
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [aiToolsList, setAiToolsList] = useState<AiToolItem[]>([]);
  const [adSlotsList, setAdSlotsList] = useState<AdSlotConfig[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [analyticsData, setAnalyticsData] = useState<{ toolUsages: any[]; aiUsages: any[] }>({
    toolUsages: [],
    aiUsages: [],
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New Article Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newBody, setNewBody] = useState('');

  // Helper headers for RBAC
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
    'x-user-role': adminRole,
    'x-demo-admin': 'true',
  });

  const fetchDashboard = () => {
    setLoading(true);
    fetch('/api/v1/admin/dashboard', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDashboardData(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchTools = () => {
    fetch('/api/v1/admin/tools', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setToolsList(data.data));
  };

  const fetchArticles = () => {
    fetch('/api/v1/admin/articles', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setArticlesList(data.data));
  };

  const fetchAiTools = () => {
    fetch('/api/v1/admin/ai-tools', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setAiToolsList(data.data));
  };

  const fetchAdSlots = () => {
    fetch('/api/v1/admin/ad-slots', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setAdSlotsList(data.data));
  };

  const fetchSettings = () => {
    fetch('/api/v1/admin/settings', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setSiteSettings(data.data));
  };

  const fetchAnalytics = () => {
    fetch('/api/v1/admin/analytics', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setAnalyticsData(data.data));
  };

  const fetchAuditLogs = () => {
    fetch('/api/v1/admin/audit-logs', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => data.success && setAuditLogs(data.data));
  };

  useEffect(() => {
    fetchDashboard();
    fetchTools();
    fetchArticles();
    fetchAiTools();
    fetchAdSlots();
    fetchSettings();
    fetchAnalytics();
    fetchAuditLogs();
  }, [adminRole, adminKey]);

  const handleToggleToolFeatured = async (tool: Tool) => {
    try {
      const res = await fetch(`/api/v1/admin/tools/${tool.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isFeatured: !tool.isFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Updated featured status for ${tool.name}`);
        fetchTools();
        fetchDashboard();
      }
    } catch (e: any) {
      setStatusMsg(e.message);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await fetch('/api/v1/admin/articles', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || newTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
          excerpt: newExcerpt,
          body: newBody,
          status: 'PUBLISHED',
          type: 'guide',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Published article: ${newTitle}`);
        setNewTitle('');
        setNewSlug('');
        setNewExcerpt('');
        setNewBody('');
        fetchArticles();
        fetchDashboard();
      }
    } catch (e: any) {
      setStatusMsg(e.message);
    }
  };

  const handleToggleAdSlot = async (slot: AdSlotConfig) => {
    try {
      const res = await fetch(`/api/v1/admin/ad-slots/${slot.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ enabled: !slot.enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Updated ad slot: ${slot.slotKey}`);
        fetchAdSlots();
      }
    } catch (e: any) {
      setStatusMsg(e.message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Site settings updated successfully.');
      }
    } catch (e: any) {
      setStatusMsg(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <SEOHead
        title="Admin Control Center | ClarifyAll"
        description="ClarifyAll Administrative System: tools, content, AI metrics, and security."
      />

      {/* Admin Top Bar with Live Role Switcher */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ClarifyAll Admin Control Center</h1>
            <p className="text-xs text-slate-400">
              Server-authoritative Role-Based Access Control (RBAC)
            </p>
          </div>
        </div>

        {/* Role Switcher for verification */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Test Role:</span>
          {(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'ANALYST'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => {
                setAdminRole(role);
                setStatusMsg(`Switched active RBAC test role to: ${role}`);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                adminRole === role
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 rounded-xl text-xs flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-xs underline ml-2">Dismiss</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: BarChart3 },
          { id: 'tools', label: 'Tools Management', icon: Wrench },
          { id: 'articles', label: 'Content & Guides', icon: BookOpen },
          { id: 'ai-tools', label: 'AI Directory', icon: Compass },
          { id: 'ad-slots', label: 'Ad Slots', icon: Megaphone },
          { id: 'settings', label: 'Site Settings', icon: Settings },
          { id: 'ai-usage', label: 'AI Usage & Cost', icon: Activity },
          { id: 'audit', label: 'Audit Logs', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Published Tools</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {dashboardData.metrics.publishedTools} / {dashboardData.metrics.totalTools}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Tool Executions</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {dashboardData.metrics.totalToolExecutions}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                {dashboardData.metrics.successRate}% Success Rate
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">AI Requests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {dashboardData.metrics.totalAiRequests}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Estimated AI Cost</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${dashboardData.metrics.estimatedAiCostUSD}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Tools by Usage */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
                Top Tools by Real Executions
              </h3>
              <div className="space-y-3">
                {dashboardData.topTools && dashboardData.topTools.length > 0 ? (
                  dashboardData.topTools.map((tt: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-mono text-slate-700 dark:text-slate-300">{tt.slug}</span>
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {tt.count} calls
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No tool execution telemetry recorded yet.</p>
                )}
              </div>
            </div>

            {/* Google Search Console Status */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  Google Search Console &amp; SEO
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {dashboardData.searchConsoleStatus}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs text-indigo-800 dark:text-indigo-300">
                Sitemaps at <code className="font-mono">/sitemap.xml</code> • Robots at <code className="font-mono">/robots.txt</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOOLS MANAGEMENT */}
      {activeTab === 'tools' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Registered Utilities ({toolsList.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {toolsList.map(t => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-400 font-mono">/tools/{t.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleToolFeatured(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                      t.isFeatured
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {t.isFeatured ? 'Featured on Home' : 'Standard'}
                  </button>
                  <span className="px-2.5 py-1 text-xs rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-medium">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT & GUIDES */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          {/* New Article Form */}
          <form onSubmit={handleCreateArticle} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create New Article / Tutorial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Article Title *"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
              <input
                type="text"
                placeholder="URL Slug (e.g. how-to-compress-pdf)"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <textarea
              placeholder="Article Excerpt (1-2 sentences for SEO & previews)..."
              value={newExcerpt}
              onChange={e => setNewExcerpt(e.target.value)}
              rows={2}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
            <textarea
              placeholder="Full Article Body (Markdown supported)..."
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              rows={6}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm min-h-[44px]"
            >
              Publish Article
            </button>
          </form>

          {/* Existing Articles */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Published Guides ({articlesList.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {articlesList.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-slate-400">/{a.type === 'guide' ? 'guides' : 'blog'}/{a.slug}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI DIRECTORY */}
      {activeTab === 'ai-tools' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            AI Directory Products ({aiToolsList.length})
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {aiToolsList.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.pricingModel} • {item.vendorUrl}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AD SLOTS */}
      {activeTab === 'ad-slots' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Configurable Advertising Slots
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Compliant with Section 16: Ads remain disabled until Google AdSense approval is confirmed.
            </p>
          </div>

          <div className="space-y-3">
            {adSlotsList.map(slot => (
              <div
                key={slot.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{slot.placement}</p>
                  <p className="text-xs text-slate-400 font-mono">Slot Key: {slot.slotKey}</p>
                </div>
                <button
                  onClick={() => {
                    handleToggleAdSlot(slot);
                    setAdsEnabled(!adsEnabled);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[40px] ${
                    slot.enabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {slot.enabled ? 'Enabled' : 'Disabled (Default)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Global Platform Settings
            </h2>
            <button
              onClick={handleSaveSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm min-h-[40px]"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(siteSettings).map(([key, val]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                  {key}
                </label>
                <input
                  type="text"
                  value={val}
                  onChange={e => setSiteSettings({ ...siteSettings, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AI USAGE & COST TELEMETRY */}
      {activeTab === 'ai-usage' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            AI Provider Real-Time Telemetry
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-3">Operation</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Est. Tokens</th>
                  <th className="p-3">Cost (USD)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analyticsData.aiUsages.map(u => (
                  <tr key={u.id}>
                    <td className="p-3 font-medium">{u.operation}</td>
                    <td className="p-3 font-mono">{u.model}</td>
                    <td className="p-3">{(u.inputTokens || 0) + (u.outputTokens || 0)}</td>
                    <td className="p-3 font-mono text-emerald-600">${Number(u.estimatedCost || 0).toFixed(6)}</td>
                    <td className="p-3 font-bold text-emerald-500">{u.status}</td>
                    <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            System &amp; Admin Audit Trail
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</span>
                  <span className="text-slate-400 ml-2">• {log.entity}</span>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-slate-400 shrink-0 font-mono">
                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
