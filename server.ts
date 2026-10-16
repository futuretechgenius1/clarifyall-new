import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiV1Router from './server/routes/v1.js';
import { dbStore } from './server/db/store.js';
import { syncWithHostinger } from './server/db/syncHostinger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';
const APP_URL = process.env.APP_URL || 'https://clarifyall.com';

// Security and body parser middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// CORS & Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Mount /api/v1 router
app.use('/api/v1', apiV1Router);

// ==========================================
// TECHNICAL SEO: robots.txt & sitemap.xml
// ==========================================

app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /tools/
Allow: /categories/
Allow: /guides/
Allow: /blog/
Allow: /ai-tools/
Allow: /prompts/
Disallow: /admin/
Disallow: /api/

Sitemap: ${APP_URL}/sitemap.xml
`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${APP_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${APP_URL}/tools`, priority: '0.9', changefreq: 'daily' },
    { loc: `${APP_URL}/categories`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${APP_URL}/ai-tools`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${APP_URL}/guides`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${APP_URL}/blog`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${APP_URL}/prompts`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${APP_URL}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${APP_URL}/contact`, priority: '0.5', changefreq: 'monthly' },
  ];

  const toolUrls = dbStore.tools.map(t => ({
    loc: `${APP_URL}/tools/${t.slug}`,
    priority: t.isFeatured ? '0.9' : '0.8',
    changefreq: 'weekly',
  }));

  const categoryUrls = dbStore.categories.map(c => ({
    loc: `${APP_URL}/categories/${c.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

  const articleUrls = dbStore.articles.map(a => ({
    loc: `${APP_URL}/${a.type === 'guide' ? 'guides' : a.type === 'blog' ? 'blog' : 'prompts'}/${a.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  }));

  const aiToolUrls = dbStore.aiTools.map(at => ({
    loc: `${APP_URL}/ai-tools/${at.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

  const allUrls = [...staticUrls, ...toolUrls, ...categoryUrls, ...articleUrls, ...aiToolUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.send(sitemapXml);
});

// Helper for dynamic SEO metadata injection into index.html
function injectSeoMetadata(html: string, reqPath: string): string {
  let title = 'ClarifyAll – AI Utilities & Productivity Platform';
  let description = 'Free online AI utilities, PDF tools, image compressors, writing assistants, and productivity calculators. AI. Made Clear.';
  let canonical = `${APP_URL}${reqPath}`;

  if (reqPath.startsWith('/tools/')) {
    const slug = reqPath.replace('/tools/', '').split('/')[0];
    const tool = dbStore.tools.find(t => t.slug === slug);
    if (tool) {
      title = tool.seoTitle || `${tool.name} – Free Online Tool | ClarifyAll`;
      description = tool.seoDescription || tool.description;
    }
  } else if (reqPath.startsWith('/categories/')) {
    const slug = reqPath.replace('/categories/', '').split('/')[0];
    const cat = dbStore.categories.find(c => c.slug === slug);
    if (cat) {
      title = cat.seoTitle || `${cat.name} Utilities – ClarifyAll`;
      description = cat.seoDescription || cat.description;
    }
  } else if (reqPath.startsWith('/guides/') || reqPath.startsWith('/blog/') || reqPath.startsWith('/prompts/')) {
    const slug = reqPath.split('/')[2];
    const article = dbStore.articles.find(a => a.slug === slug);
    if (article) {
      title = article.seoTitle || `${article.title} | ClarifyAll`;
      description = article.seoDescription || article.excerpt;
    }
  } else if (reqPath.startsWith('/ai-tools/')) {
    const slug = reqPath.replace('/ai-tools/', '').split('/')[0];
    const at = dbStore.aiTools.find(item => item.slug === slug);
    if (at) {
      title = `${at.name} Review, Features & Pricing (2026) | ClarifyAll`;
      description = at.description;
    }
  }

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
}

async function startServer() {
  // Sync and initialize Hostinger MySQL database
  syncWithHostinger().catch(err => console.error('[MySQL Init] Sync error:', err));

  if (!isProduction) {
    // Development mode: attach Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Handle HTML page requests with dynamic SEO metadata injection
    app.use(async (req: Request, res: Response, next) => {
      // Pass asset and API requests through to vite/express
      if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }

      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const transformed = injectSeoMetadata(template, url);
        if (req.method === 'HEAD') {
          res.status(200).set({ 'Content-Type': 'text/html' }).end();
          return;
        }
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    // Use vite's middlewares for assets and HMR
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.use('*', (req: Request, res: Response) => {
      try {
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          html = injectSeoMetadata(html, req.originalUrl);
          res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
        } else {
          res.status(404).send('Not Found');
        }
      } catch (err) {
        res.status(500).send('Internal Server Error');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClarifyAll full-stack server running on http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
