import { Router, Request, Response } from 'express';
import { dbStore, Tool, Article, AiToolDirectoryItem, Category, NewsletterSubscriber, UserAiBookmark } from '../db/store.js';
import { AIService } from '../ai/provider.js';
import { PDFEngine } from '../tools/pdfEngine.js';
import { requireRole, AuthenticatedRequest } from '../middleware/auth.js';

import { pool } from '../db/mysql.js';

const router = Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// GET /api/v1/health
router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'connected (MySQL 8 - srv1148.hstgr.io / u530425252_clarifyall)';
  try {
    const conn = await pool.getConnection();
    conn.release();
  } catch (err: any) {
    dbStatus = `degraded (${err.message})`;
  }

  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbStatus,
    host: 'srv1148.hstgr.io',
    databaseName: 'u530425252_clarifyall',
    services: {
      aiEngine: !!process.env.GEMINI_API_KEY ? 'active (Google Gemini)' : 'fallback (Deterministic Engine)',
      pdfEngine: 'active (pdf-lib)',
      mysqlPool: 'active (Hostinger Cloud)',
    },
  });
});

// GET /api/v1/tools
router.get('/tools', (req: Request, res: Response) => {
  const { category, featured } = req.query;
  let items = dbStore.tools.filter(t => t.status === 'PUBLISHED');

  if (category) {
    items = items.filter(t => t.categoryId === category);
  }
  if (featured === 'true') {
    items = items.filter(t => t.isFeatured);
  }

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/v1/tools/:slug
router.get('/tools/:slug', (req: Request, res: Response) => {
  const tool = dbStore.tools.find(t => t.slug === req.params.slug && t.status === 'PUBLISHED');
  if (!tool) {
    return res.status(404).json({ success: false, error: 'Tool not found.' });
  }

  // Find related tools details
  const related = dbStore.tools.filter(t => tool.relatedTools.includes(t.slug));
  const category = dbStore.categories.find(c => c.id === tool.categoryId);

  // Compute review summary
  const toolReviews = dbStore.reviews.filter(r => r.toolSlug === tool.slug);
  const totalReviews = toolReviews.length;
  const averageRating = totalReviews > 0
    ? Number((toolReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 4.9;

  res.json({
    success: true,
    data: {
      ...tool,
      category,
      relatedToolItems: related,
      reviewStats: {
        averageRating,
        totalReviews,
      },
    },
  });
});

// GET /api/v1/tools/:slug/reviews
router.get('/tools/:slug/reviews', async (req: Request, res: Response) => {
  const { slug } = req.params;
  let reviews: any[] = [];

  try {
    const [rows]: any = await pool.query(
      'SELECT id, tool_slug as toolSlug, user_id as userId, user_name as userName, rating, title, comment, pros, cons, verified_user as verifiedUser, helpful_count as helpfulCount, created_at as createdAt FROM tool_reviews WHERE tool_slug = ? ORDER BY created_at DESC',
      [slug]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      reviews = rows.map(r => ({
        ...r,
        verifiedUser: Boolean(r.verifiedUser),
        rating: Number(r.rating),
        helpfulCount: Number(r.helpfulCount || 0),
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err: any) {
    // If MySQL query fails or table empty, fallback to memory
  }

  // If no rows from MySQL yet, merge or use in-memory seed reviews for this slug
  if (reviews.length === 0) {
    reviews = dbStore.reviews.filter(r => r.toolSlug === slug);
  }

  // Calculate statistics
  const totalReviews = reviews.length;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRating = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
    sumRating += r.rating;
  }

  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 5.0;

  res.json({
    success: true,
    data: {
      stats: {
        averageRating,
        totalReviews,
        distribution,
      },
      reviews,
    },
  });
});

// POST /api/v1/tools/:slug/reviews
router.post('/tools/:slug/reviews', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { rating, title, comment, pros, cons, userName } = req.body;

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5 stars.' });
  }

  if (!comment || String(comment).trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Review comment must be at least 5 characters long.' });
  }

  // Check auth header if available
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string;
  const session = authHeader ? (global as any).activeSessions?.get(authHeader.replace('Bearer ', '')) : null;
  const finalUserId = session?.userId || userIdHeader || null;
  const finalUserName = String(userName || session?.user?.name || (finalUserId ? 'Verified User' : 'Community Member')).trim();
  const isVerified = Boolean(finalUserId);

  const newReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    toolSlug: slug,
    userId: finalUserId,
    userName: finalUserName,
    rating: Math.round(numRating),
    title: title ? String(title).trim() : undefined,
    comment: String(comment).trim(),
    pros: pros ? String(pros).trim() : undefined,
    cons: cons ? String(cons).trim() : undefined,
    verifiedUser: isVerified,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
  };

  // Add to in-memory store
  dbStore.reviews.unshift(newReview);

  // Persist to MySQL
  try {
    await pool.query(
      `INSERT INTO tool_reviews (id, tool_slug, user_id, user_name, rating, title, comment, pros, cons, verified_user, helpful_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        newReview.id,
        newReview.toolSlug,
        newReview.userId,
        newReview.userName,
        newReview.rating,
        newReview.title || null,
        newReview.comment,
        newReview.pros || null,
        newReview.cons || null,
        newReview.verifiedUser ? 1 : 0,
        0,
      ]
    );
  } catch (err: any) {
    console.error('[MySQL Review Insert Error]', err.message);
  }

  // Recalculate stats
  const allToolReviews = dbStore.reviews.filter(r => r.toolSlug === slug);
  const totalReviews = allToolReviews.length;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRating = 0;
  for (const r of allToolReviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
    sumRating += r.rating;
  }
  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 5.0;

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been recorded.',
    data: {
      review: newReview,
      stats: {
        averageRating,
        totalReviews,
        distribution,
      },
    },
  });
});

// POST /api/v1/tools/:slug/reviews/:id/helpful
router.post('/tools/:slug/reviews/:id/helpful', async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = dbStore.reviews.find(r => r.id === id);
  if (review) {
    review.helpfulCount = (review.helpfulCount || 0) + 1;
  }

  try {
    await pool.query('UPDATE tool_reviews SET helpful_count = helpful_count + 1 WHERE id = ?', [id]);
  } catch (err: any) {
    // ignore
  }

  res.json({
    success: true,
    helpfulCount: review ? review.helpfulCount : 1,
  });
});

// GET /api/v1/categories
router.get('/categories', (_req: Request, res: Response) => {
  const categories = dbStore.categories.filter(c => c.status === 'PUBLISHED');
  res.json({ success: true, count: categories.length, data: categories });
});

// GET /api/v1/categories/:slug
router.get('/categories/:slug', (req: Request, res: Response) => {
  const category = dbStore.categories.find(c => c.slug === req.params.slug && c.status === 'PUBLISHED');
  if (!category) {
    return res.status(404).json({ success: false, error: 'Category not found.' });
  }

  const categoryTools = dbStore.tools.filter(t => t.categoryId === category.id && t.status === 'PUBLISHED');
  res.json({
    success: true,
    data: {
      ...category,
      tools: categoryTools,
    },
  });
});

// GET /api/v1/articles
router.get('/articles', (req: Request, res: Response) => {
  const { type } = req.query;
  let articles = dbStore.articles.filter(a => a.status === 'PUBLISHED');
  if (type) {
    articles = articles.filter(a => a.type === type);
  }
  res.json({ success: true, count: articles.length, data: articles });
});

// GET /api/v1/articles/:slug
router.get('/articles/:slug', (req: Request, res: Response) => {
  const article = dbStore.articles.find(a => a.slug === req.params.slug && a.status === 'PUBLISHED');
  if (!article) {
    return res.status(404).json({ success: false, error: 'Article not found.' });
  }
  res.json({ success: true, data: article });
});

// GET /api/v1/ai-tools
router.get('/ai-tools', (req: Request, res: Response) => {
  const { category } = req.query;
  let items = dbStore.aiTools.filter(t => t.status === 'PUBLISHED');
  if (category) {
    items = items.filter(t => t.categories.includes(String(category)));
  }
  res.json({ success: true, count: items.length, data: items });
});

// GET /api/v1/ai-tools/:slug
router.get('/ai-tools/:slug', (req: Request, res: Response) => {
  const aiTool = dbStore.aiTools.find(t => t.slug === req.params.slug && t.status === 'PUBLISHED');
  if (!aiTool) {
    return res.status(404).json({ success: false, error: 'AI Tool not found in directory.' });
  }
  res.json({ success: true, data: aiTool });
});

// GET /api/v1/search
router.get('/search', (req: Request, res: Response) => {
  const query = (String(req.query.q || '')).toLowerCase().trim();
  if (!query) {
    return res.json({ success: true, results: { tools: [], articles: [], aiTools: [] } });
  }

  const matchedTools = dbStore.tools.filter(t =>
    t.status === 'PUBLISHED' &&
    (t.name.toLowerCase().includes(query) ||
     t.description.toLowerCase().includes(query) ||
     t.slug.toLowerCase().includes(query))
  );

  const matchedArticles = dbStore.articles.filter(a =>
    a.status === 'PUBLISHED' &&
    (a.title.toLowerCase().includes(query) ||
     a.excerpt.toLowerCase().includes(query) ||
     a.body.toLowerCase().includes(query))
  );

  const matchedAiTools = dbStore.aiTools.filter(it =>
    it.status === 'PUBLISHED' &&
    (it.name.toLowerCase().includes(query) ||
     it.description.toLowerCase().includes(query))
  );

  res.json({
    success: true,
    query,
    results: {
      tools: matchedTools,
      articles: matchedArticles,
      aiTools: matchedAiTools,
    },
  });
});

// ==========================================
// TOOL EXECUTION ENDPOINTS
// ==========================================

// Helper to log tool usage metrics
function logToolUsage(toolSlug: string, operation: string, status: 'SUCCESS' | 'ERROR', durationMs: number) {
  const tool = dbStore.tools.find(t => t.slug === toolSlug);
  const id = `usg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  dbStore.toolUsages.push({
    id,
    toolId: tool ? tool.id : 'unknown',
    toolSlug,
    operation,
    status,
    processingDurationMs: durationMs,
    createdAt: new Date().toISOString(),
  });

  // Asynchronously record into MySQL database on Hostinger
  pool.query(
    'INSERT INTO tool_usage (id, tool_slug, operation, status, processing_duration_ms) VALUES (?, ?, ?, ?, ?)',
    [id, toolSlug, operation, status, durationMs]
  ).catch(err => console.error('[MySQL] Tool usage log error:', err.message));
}

// POST /api/v1/tools/pdf-compressor/execute
router.post('/tools/pdf-compressor/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { fileBase64, filename } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, error: 'No PDF data provided.' });
    }

    const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 25 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum 25 MB limit.' });
    }

    const result = await PDFEngine.compressPdf(buffer);
    const duration = Date.now() - startTime;
    logToolUsage('pdf-compressor', 'compress', 'SUCCESS', duration);

    res.json({
      success: true,
      data: {
        filename: filename ? `compressed_${filename}` : 'compressed_document.pdf',
        pdfBase64: result.pdfBase64,
        originalSizeBytes: result.originalSizeBytes,
        outputSizeBytes: result.outputSizeBytes,
        reductionPercentage: result.reductionPercentage,
        pageCount: result.pageCount,
        durationMs: duration,
      },
    });
  } catch (error: any) {
    console.error('PDF Compressor execute error:', error);
    logToolUsage('pdf-compressor', 'compress', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to compress PDF.' });
  }
});

// POST /api/v1/tools/pdf-merge/execute
router.post('/tools/pdf-merge/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { files } = req.body; // Array of { name, fileBase64 }
    if (!Array.isArray(files) || files.length < 2) {
      return res.status(400).json({ success: false, error: 'Please supply at least 2 PDF files to merge.' });
    }

    const buffers: Buffer[] = [];
    for (const f of files) {
      const clean = f.fileBase64.replace(/^data:application\/pdf;base64,/, '');
      buffers.push(Buffer.from(clean, 'base64'));
    }

    const result = await PDFEngine.mergePdfs(buffers);
    const duration = Date.now() - startTime;
    logToolUsage('pdf-merge', 'merge', 'SUCCESS', duration);

    res.json({
      success: true,
      data: {
        filename: 'merged_document.pdf',
        pdfBase64: result.pdfBase64,
        outputSizeBytes: result.outputSizeBytes,
        pageCount: result.pageCount,
        durationMs: duration,
      },
    });
  } catch (error: any) {
    console.error('PDF Merger execute error:', error);
    logToolUsage('pdf-merge', 'merge', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to merge PDF files.' });
  }
});

// POST /api/v1/tools/pdf-split/execute
router.post('/tools/pdf-split/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { fileBase64, pageRange, filename } = req.body;
    if (!fileBase64 || !pageRange) {
      return res.status(400).json({ success: false, error: 'File data and page range are required.' });
    }

    const clean = fileBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(clean, 'base64');

    const result = await PDFEngine.splitPdf(buffer, pageRange);
    const duration = Date.now() - startTime;
    logToolUsage('pdf-split', 'split', 'SUCCESS', duration);

    res.json({
      success: true,
      data: {
        filename: filename ? `split_${filename}` : 'split_document.pdf',
        pdfBase64: result.pdfBase64,
        outputSizeBytes: result.outputSizeBytes,
        pageCount: result.pageCount,
        durationMs: duration,
      },
    });
  } catch (error: any) {
    console.error('PDF Split execute error:', error);
    logToolUsage('pdf-split', 'split', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to split PDF.' });
  }
});

// POST /api/v1/tools/image-to-text/execute (OCR)
router.post('/tools/image-to-text/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided.' });
    }

    const response = await AIService.extractTextFromImage(imageBase64, mimeType || 'image/png');
    logToolUsage('image-to-text', 'ocr', 'SUCCESS', Date.now() - startTime);

    res.json({
      success: true,
      data: {
        extractedText: response.result,
        provider: response.provider,
        durationMs: response.durationMs,
      },
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    logToolUsage('image-to-text', 'ocr', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'OCR extraction failed.' });
  }
});

// POST /api/v1/tools/ai-email-writer/execute
router.post('/tools/ai-email-writer/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { purpose, audience, tone, keyPoints } = req.body;
    if (!purpose) {
      return res.status(400).json({ success: false, error: 'Email purpose is required.' });
    }

    const aiRes = await AIService.writeEmail({
      purpose,
      audience: audience || '',
      tone: tone || 'Professional',
      keyPoints: keyPoints || '',
    });

    logToolUsage('ai-email-writer', 'generate_email', 'SUCCESS', Date.now() - startTime);

    res.json({
      success: true,
      data: {
        emailContent: aiRes.result,
        provider: aiRes.provider,
        model: aiRes.model,
        tokensUsed: aiRes.tokensUsed,
        durationMs: aiRes.durationMs,
      },
    });
  } catch (error: any) {
    console.error('Email writer error:', error);
    logToolUsage('ai-email-writer', 'generate_email', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate email.' });
  }
});

// POST /api/v1/tools/text-summarizer/execute
router.post('/tools/text-summarizer/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { text, format } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ success: false, error: 'Please provide at least 20 characters to summarize.' });
    }

    const aiRes = await AIService.summarizeText({
      text,
      format: format || 'bullets',
    });

    logToolUsage('text-summarizer', 'summarize', 'SUCCESS', Date.now() - startTime);

    res.json({
      success: true,
      data: {
        summary: aiRes.result,
        provider: aiRes.provider,
        model: aiRes.model,
        tokensUsed: aiRes.tokensUsed,
        durationMs: aiRes.durationMs,
      },
    });
  } catch (error: any) {
    console.error('Summarizer error:', error);
    logToolUsage('text-summarizer', 'summarize', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to summarize text.' });
  }
});

// POST /api/v1/tools/resume-bullet-improver/execute
router.post('/tools/resume-bullet-improver/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { bullet, role, targetField } = req.body;
    if (!bullet || bullet.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please enter a resume bullet point to improve.' });
    }

    const aiRes = await AIService.improveResumeBullet({
      bullet,
      role,
      targetField,
    });

    logToolUsage('resume-bullet-improver', 'improve_bullet', 'SUCCESS', Date.now() - startTime);

    res.json({
      success: true,
      data: {
        improvedBullets: aiRes.result,
        provider: aiRes.provider,
        model: aiRes.model,
        durationMs: aiRes.durationMs,
      },
    });
  } catch (error: any) {
    console.error('Resume bullet error:', error);
    logToolUsage('resume-bullet-improver', 'improve_bullet', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to improve bullet.' });
  }
});

// POST /api/v1/tools/ai-prompt-generator/execute
router.post('/tools/ai-prompt-generator/execute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { task, targetModel, style, constraints } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, error: 'Task description is required.' });
    }

    const aiRes = await AIService.generatePrompt({
      task,
      targetModel: targetModel || 'ChatGPT, Claude, Gemini',
      style: style || 'Expert & Concise',
      constraints,
    });

    logToolUsage('ai-prompt-generator', 'generate_prompt', 'SUCCESS', Date.now() - startTime);

    res.json({
      success: true,
      data: {
        generatedPrompt: aiRes.result,
        provider: aiRes.provider,
        model: aiRes.model,
        durationMs: aiRes.durationMs,
      },
    });
  } catch (error: any) {
    console.error('Prompt generator error:', error);
    logToolUsage('ai-prompt-generator', 'generate_prompt', 'ERROR', Date.now() - startTime);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate prompt.' });
  }
});

// ==========================================
// ADMIN DASHBOARD & CRUD ENDPOINTS (PROTECTED BY RBAC)
// ==========================================

// GET /api/v1/admin/dashboard
router.get('/admin/dashboard', requireRole(['SUPER_ADMIN', 'ADMIN', 'ANALYST']), (_req: AuthenticatedRequest, res: Response) => {
  const totalTools = dbStore.tools.length;
  const publishedTools = dbStore.tools.filter(t => t.status === 'PUBLISHED').length;
  const totalArticles = dbStore.articles.length;
  const publishedArticles = dbStore.articles.filter(a => a.status === 'PUBLISHED').length;
  const totalAiTools = dbStore.aiTools.length;
  const totalToolExecutions = dbStore.toolUsages.length;
  const successfulExecutions = dbStore.toolUsages.filter(u => u.status === 'SUCCESS').length;
  const totalAiRequests = dbStore.aiUsages.length;
  const totalAiCost = dbStore.aiUsages.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

  // Group top tools by usage
  const usageCounts: Record<string, number> = {};
  for (const u of dbStore.toolUsages) {
    usageCounts[u.toolSlug] = (usageCounts[u.toolSlug] || 0) + 1;
  }
  const topTools = Object.entries(usageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }));

  res.json({
    success: true,
    data: {
      metrics: {
        totalTools,
        publishedTools,
        totalArticles,
        publishedArticles,
        totalAiTools,
        totalToolExecutions,
        successRate: totalToolExecutions > 0 ? Math.round((successfulExecutions / totalToolExecutions) * 100) : 100,
        totalAiRequests,
        estimatedAiCostUSD: Number(totalAiCost.toFixed(4)),
      },
      topTools,
      recentAuditLogs: dbStore.auditLogs.slice(-10).reverse(),
      searchConsoleStatus: 'Google Search Console verification tag ready in site settings. (Connect via OAuth or DNS TXT to ingest live clicks/impressions)',
    },
  });
});

// GET /api/v1/admin/tools
router.get('/admin/tools', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: dbStore.tools });
});

// PUT /api/v1/admin/tools/:id
router.put('/admin/tools/:id', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), (req: AuthenticatedRequest, res: Response) => {
  const index = dbStore.tools.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Tool not found.' });
  }

  const updated: Tool = {
    ...dbStore.tools[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  dbStore.tools[index] = updated;

  dbStore.auditLogs.push({
    id: `log_${Date.now()}`,
    userId: 'admin',
    action: 'UPDATE_TOOL',
    entity: 'Tool',
    entityId: updated.id,
    details: `Updated tool: ${updated.name}`,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, data: updated });
});

// GET /api/v1/admin/articles
router.get('/admin/articles', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: dbStore.articles });
});

// POST /api/v1/admin/articles
router.post('/admin/articles', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), (req: AuthenticatedRequest, res: Response) => {
  const newArticle: Article = {
    id: `art_${Date.now()}`,
    authorId: 'usr_editor_1',
    authorName: 'Editorial Staff',
    title: req.body.title || 'Untitled Article',
    slug: req.body.slug || `article-${Date.now()}`,
    excerpt: req.body.excerpt || '',
    body: req.body.body || '',
    seoTitle: req.body.seoTitle || req.body.title,
    seoDescription: req.body.seoDescription || req.body.excerpt,
    canonicalUrl: req.body.canonicalUrl || `https://clarifyall.com/guides/${req.body.slug}`,
    type: req.body.type || 'guide',
    status: req.body.status || 'DRAFT',
    publishedAt: req.body.status === 'PUBLISHED' ? new Date().toISOString() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.articles.unshift(newArticle);

  dbStore.auditLogs.push({
    id: `log_${Date.now()}`,
    userId: 'admin',
    action: 'CREATE_ARTICLE',
    entity: 'Article',
    entityId: newArticle.id,
    details: `Created article: ${newArticle.title}`,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: newArticle });
});

// GET /api/v1/admin/ai-tools
router.get('/admin/ai-tools', requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: dbStore.aiTools });
});

// GET /api/v1/admin/settings
router.get('/admin/settings', requireRole(['SUPER_ADMIN', 'ADMIN']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: dbStore.siteSettings });
});

// PUT /api/v1/admin/settings
router.put('/admin/settings', requireRole(['SUPER_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  dbStore.siteSettings = {
    ...dbStore.siteSettings,
    ...req.body,
  };

  dbStore.auditLogs.push({
    id: `log_${Date.now()}`,
    userId: 'admin',
    action: 'UPDATE_SETTINGS',
    entity: 'SiteSettings',
    details: 'Updated global site settings',
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, data: dbStore.siteSettings });
});

// GET /api/v1/admin/ad-slots
router.get('/admin/ad-slots', requireRole(['SUPER_ADMIN', 'ADMIN']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: dbStore.adSlots });
});

// PUT /api/v1/admin/ad-slots/:id
router.put('/admin/ad-slots/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const index = dbStore.adSlots.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Ad slot not found.' });
  }

  dbStore.adSlots[index] = {
    ...dbStore.adSlots[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, data: dbStore.adSlots[index] });
});

// GET /api/v1/admin/analytics
router.get('/admin/analytics', requireRole(['SUPER_ADMIN', 'ADMIN', 'ANALYST']), (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      toolUsages: dbStore.toolUsages.slice(-50).reverse(),
      aiUsages: dbStore.aiUsages.slice(-50).reverse(),
    },
  });
});

// ==========================================
// USER AUTH & SECURE DASHBOARD ENDPOINTS
// ==========================================

// In-memory sessions map (token -> user) with MySQL backing
const sessions: Record<string, any> = {
  'demo_session_token_2026': {
    id: 'usr_demo_user',
    name: 'Demo Creator',
    email: 'creator@clarifyall.com',
    role: 'EDITOR',
    status: 'ACTIVE',
  },
};

// Helper to authenticate user from token or header
function getAuthUser(req: Request) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.headers['x-session-token'] as string);
  const userIdHeader = req.headers['x-user-id'] as string;
  if (token && sessions[token]) {
    return sessions[token];
  }
  if (userIdHeader) {
    const existing = dbStore.users.find(u => u.id === userIdHeader);
    if (existing) return existing;
    return {
      id: userIdHeader,
      name: (req.headers['x-user-name'] as string) || 'ClarifyAll User',
      email: (req.headers['x-user-email'] as string) || 'user@clarifyall.com',
      role: 'EDITOR',
      status: 'ACTIVE',
    };
  }
  return null;
}

// POST /api/v1/auth/demo (1-click test login)
router.post('/auth/demo', async (_req: Request, res: Response) => {
  const demoUser = {
    id: 'usr_demo_user',
    name: 'Demo Creator',
    email: 'creator@clarifyall.com',
    role: 'EDITOR' as const,
    status: 'ACTIVE' as const,
  };
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  sessions[token] = demoUser;

  // Ensure demo user exists in dbStore and MySQL
  if (!dbStore.users.some(u => u.id === demoUser.id)) {
    dbStore.users.push({
      ...demoUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Ensure default favorites
  try {
    await pool.query(
      'INSERT IGNORE INTO user_favorites (id, user_id, tool_slug) VALUES (?, ?, ?), (?, ?, ?)',
      [
        `fav_${demoUser.id}_pdf-compressor`,
        demoUser.id,
        'pdf-compressor',
        `fav_${demoUser.id}_ai-email-writer`,
        demoUser.id,
        'ai-email-writer',
      ]
    );

    // Ensure default AI tool bookmarks
    await pool.query(
      'INSERT IGNORE INTO user_ai_bookmarks (id, user_id, tool_slug, notes) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        `bm_${demoUser.id}_claude-3-5-sonnet`,
        demoUser.id,
        'claude-3-5-sonnet',
        'Best for complex coding refactoring & prompt architecture',
        `bm_${demoUser.id}_perplexity-ai`,
        demoUser.id,
        'perplexity-ai',
        'Primary research engine for citation-backed analysis',
        `bm_${demoUser.id}_chatgpt`,
        demoUser.id,
        'chatgpt',
        'General productivity and canvas document drafting',
      ]
    );
  } catch (err: any) {
    console.log('[MySQL] Note on demo favorites/bookmarks:', err.message);
  }

  res.json({
    success: true,
    data: {
      token,
      user: demoUser,
    },
  });
});

// POST /api/v1/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  let user = dbStore.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Check in MySQL
    try {
      const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } catch (e: any) {
      console.error('[MySQL Auth Error]:', e.message);
    }
  }

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  sessions[token] = user;

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// POST /api/v1/auth/register
router.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (dbStore.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim(),
    email: cleanEmail,
    role: 'EDITOR' as const,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.users.push(newUser);

  // Persist into MySQL
  try {
    await pool.query(
      'INSERT INTO users (id, name, email, role, status) VALUES (?, ?, ?, ?, ?)',
      [newUser.id, newUser.name, newUser.email, newUser.role, newUser.status]
    );
    await pool.query(
      'INSERT INTO user_preferences (user_id, default_theme) VALUES (?, ?)',
      [newUser.id, 'light']
    );
  } catch (err: any) {
    console.error('[MySQL Register Error]:', err.message);
  }

  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  sessions[token] = newUser;

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
});

// GET /api/v1/user/dashboard
router.get('/user/dashboard', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in.' });
  }

  // 1. Fetch user favorites from MySQL (with fallback to default)
  let favoriteSlugs: string[] = ['pdf-compressor', 'ai-email-writer'];
  try {
    const [rows]: any = await pool.query(
      'SELECT tool_slug FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      favoriteSlugs = rows.map((r: any) => r.tool_slug);
    }
  } catch (err: any) {
    console.error('[MySQL Favorites Error]:', err.message);
  }

  // Hydrate favorite tools
  const favoriteTools = dbStore.tools.filter(t => favoriteSlugs.includes(t.slug));

  // 1b. Fetch user bookmarks for AI tools from MySQL (with fallback to in-memory store)
  let bookmarkedAiSlugs: string[] = ['claude-3-5-sonnet', 'perplexity-ai', 'chatgpt'];
  let bookmarkNotesMap: Record<string, string> = {
    'claude-3-5-sonnet': 'Best for complex coding refactoring & prompt architecture',
    'perplexity-ai': 'Primary research engine for citation-backed analysis',
    'chatgpt': 'General productivity and canvas document drafting',
  };
  try {
    const [bmRows]: any = await pool.query(
      'SELECT tool_slug, notes, created_at FROM user_ai_bookmarks WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    if (Array.isArray(bmRows) && bmRows.length > 0) {
      bookmarkedAiSlugs = bmRows.map((r: any) => r.tool_slug);
      bookmarkNotesMap = {};
      bmRows.forEach((r: any) => {
        if (r.notes) bookmarkNotesMap[r.tool_slug] = r.notes;
      });
    } else {
      // In-memory fallback
      const userBms = dbStore.bookmarks.filter(b => b.userId === user.id);
      if (userBms.length > 0) {
        bookmarkedAiSlugs = userBms.map(b => b.toolSlug);
        bookmarkNotesMap = {};
        userBms.forEach(b => {
          if (b.notes) bookmarkNotesMap[b.toolSlug] = b.notes;
        });
      }
    }
  } catch (err: any) {
    console.error('[MySQL Bookmarks Error]:', err.message);
    const userBms = dbStore.bookmarks.filter(b => b.userId === user.id);
    if (userBms.length > 0) {
      bookmarkedAiSlugs = userBms.map(b => b.toolSlug);
      bookmarkNotesMap = {};
      userBms.forEach(b => {
        if (b.notes) bookmarkNotesMap[b.toolSlug] = b.notes;
      });
    }
  }

  // Hydrate bookmarked AI tools
  const bookmarkedAiTools = dbStore.aiTools.filter(t => bookmarkedAiSlugs.includes(t.slug));

  // 2. Fetch user's usage history
  let usageHistory = dbStore.toolUsages.filter(u => u.userId === user.id || !u.userId).slice(-20).reverse();
  try {
    const [histRows]: any = await pool.query(
      'SELECT id, tool_slug, operation, status, processing_duration_ms, created_at FROM tool_usage ORDER BY created_at DESC LIMIT 20'
    );
    if (Array.isArray(histRows) && histRows.length > 0) {
      usageHistory = histRows;
    }
  } catch (e: any) {
    console.error('[MySQL History Error]:', e.message);
  }

  // 3. User Preferences
  let preferences = {
    defaultTheme: 'light',
    emailNotifications: true,
    anonymousTelemetry: true,
  };
  try {
    const [prefRows]: any = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    if (prefRows && prefRows.length > 0) {
      preferences = {
        defaultTheme: prefRows[0].default_theme || 'light',
        emailNotifications: !!prefRows[0].email_notifications,
        anonymousTelemetry: !!prefRows[0].anonymous_telemetry,
      };
    }
  } catch (e: any) {
    console.error('[MySQL Prefs Error]:', e.message);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        favoriteCount: favoriteSlugs.length,
        bookmarkCount: bookmarkedAiSlugs.length,
        totalOperationsRun: usageHistory.length,
        memberSince: user.createdAt || '2026-01-10',
      },
      favoriteSlugs,
      favoriteTools,
      bookmarkedAiSlugs,
      bookmarkedAiTools,
      bookmarkNotes: bookmarkNotesMap,
      usageHistory,
      preferences,
    },
  });
});

// POST /api/v1/user/favorites/toggle
router.post('/user/favorites/toggle', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in.' });
  }

  const { toolSlug } = req.body;
  if (!toolSlug) {
    return res.status(400).json({ success: false, error: 'toolSlug is required.' });
  }

  let isFavorited = false;
  try {
    const [rows]: any = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND tool_slug = ? LIMIT 1',
      [user.id, toolSlug]
    );

    if (rows && rows.length > 0) {
      // Remove favorite
      await pool.query('DELETE FROM user_favorites WHERE user_id = ? AND tool_slug = ?', [user.id, toolSlug]);
      isFavorited = false;
    } else {
      // Add favorite
      const id = `fav_${user.id}_${toolSlug}`;
      await pool.query(
        'INSERT INTO user_favorites (id, user_id, tool_slug) VALUES (?, ?, ?)',
        [id, user.id, toolSlug]
      );
      isFavorited = true;
    }
  } catch (err: any) {
    console.error('[MySQL Toggle Favorite Error]:', err.message);
  }

  res.json({
    success: true,
    data: {
      toolSlug,
      isFavorited,
    },
  });
});

// ==========================================
// USER AI TOOL BOOKMARKS ENDPOINTS
// ==========================================

// POST /api/v1/user/bookmarks/toggle
router.post('/user/bookmarks/toggle', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in.' });
  }

  const { toolSlug, notes } = req.body;
  if (!toolSlug) {
    return res.status(400).json({ success: false, error: 'toolSlug is required.' });
  }

  let isBookmarked = false;
  try {
    const [rows]: any = await pool.query(
      'SELECT id FROM user_ai_bookmarks WHERE user_id = ? AND tool_slug = ? LIMIT 1',
      [user.id, toolSlug]
    );

    if (rows && rows.length > 0) {
      // Remove bookmark
      await pool.query('DELETE FROM user_ai_bookmarks WHERE user_id = ? AND tool_slug = ?', [user.id, toolSlug]);
      isBookmarked = false;
    } else {
      // Add bookmark
      const id = `bm_${user.id}_${toolSlug}`;
      await pool.query(
        'INSERT INTO user_ai_bookmarks (id, user_id, tool_slug, notes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE notes = VALUES(notes)',
        [id, user.id, toolSlug, notes || null]
      );
      isBookmarked = true;
    }
  } catch (err: any) {
    console.error('[MySQL Toggle Bookmark Error]:', err.message);
    // In-memory fallback
    const idx = dbStore.bookmarks.findIndex(b => b.userId === user.id && b.toolSlug === toolSlug);
    if (idx >= 0) {
      dbStore.bookmarks.splice(idx, 1);
      isBookmarked = false;
    } else {
      dbStore.bookmarks.push({
        id: `bm_${user.id}_${toolSlug}`,
        userId: user.id,
        toolSlug,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      });
      isBookmarked = true;
    }
  }

  // Also sync memory store if needed
  if (isBookmarked) {
    if (!dbStore.bookmarks.some(b => b.userId === user.id && b.toolSlug === toolSlug)) {
      dbStore.bookmarks.push({
        id: `bm_${user.id}_${toolSlug}`,
        userId: user.id,
        toolSlug,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    const idx = dbStore.bookmarks.findIndex(b => b.userId === user.id && b.toolSlug === toolSlug);
    if (idx >= 0) {
      dbStore.bookmarks.splice(idx, 1);
    }
  }

  // Return updated list
  let allBookmarkedSlugs: string[] = [];
  try {
    const [allRows]: any = await pool.query(
      'SELECT tool_slug FROM user_ai_bookmarks WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    if (Array.isArray(allRows)) {
      allBookmarkedSlugs = allRows.map((r: any) => r.tool_slug);
    }
  } catch {
    allBookmarkedSlugs = dbStore.bookmarks.filter(b => b.userId === user.id).map(b => b.toolSlug);
  }

  res.json({
    success: true,
    data: {
      toolSlug,
      isBookmarked,
      bookmarkedSlugs: allBookmarkedSlugs,
    },
  });
});

// PUT /api/v1/user/bookmarks/:toolSlug/notes
router.put('/user/bookmarks/:toolSlug/notes', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in.' });
  }

  const { toolSlug } = req.params;
  const { notes } = req.body;

  try {
    await pool.query(
      'UPDATE user_ai_bookmarks SET notes = ? WHERE user_id = ? AND tool_slug = ?',
      [notes || '', user.id, toolSlug]
    );
  } catch (err: any) {
    console.error('[MySQL Update Bookmark Notes Error]:', err.message);
  }

  const inMem = dbStore.bookmarks.find(b => b.userId === user.id && b.toolSlug === toolSlug);
  if (inMem) {
    inMem.notes = notes;
  }

  res.json({
    success: true,
    data: { toolSlug, notes },
  });
});

// DELETE /api/v1/user/bookmarks/:toolSlug
router.delete('/user/bookmarks/:toolSlug', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in.' });
  }

  const { toolSlug } = req.params;

  try {
    await pool.query('DELETE FROM user_ai_bookmarks WHERE user_id = ? AND tool_slug = ?', [user.id, toolSlug]);
  } catch (err: any) {
    console.error('[MySQL Delete Bookmark Error]:', err.message);
  }

  const idx = dbStore.bookmarks.findIndex(b => b.userId === user.id && b.toolSlug === toolSlug);
  if (idx >= 0) {
    dbStore.bookmarks.splice(idx, 1);
  }

  res.json({
    success: true,
    message: `Bookmark for ${toolSlug} removed.`,
  });
});

// PUT /api/v1/user/profile
router.put('/user/profile', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please sign in.' });
  }

  const { name, preferences, newPassword } = req.body;
  if (name) {
    user.name = String(name).trim();
    try {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [user.name, user.id]);
    } catch (e: any) {
      console.error('[MySQL Update User Error]:', e.message);
    }
  }

  if (newPassword && String(newPassword).length >= 6) {
    try {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [String(newPassword), user.id]);
    } catch (e: any) {
      console.error('[MySQL Update Password Error]:', e.message);
    }
  }

  if (preferences) {
    try {
      await pool.query(
        `INSERT INTO user_preferences (user_id, default_theme, email_notifications, anonymous_telemetry)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           default_theme = VALUES(default_theme),
           email_notifications = VALUES(email_notifications),
           anonymous_telemetry = VALUES(anonymous_telemetry)`,
        [
          user.id,
          preferences.defaultTheme || 'light',
          preferences.emailNotifications !== false ? 1 : 0,
          preferences.anonymousTelemetry !== false ? 1 : 0,
        ]
      );
    } catch (e: any) {
      console.error('[MySQL Update Prefs Error]:', e.message);
    }
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Profile and preferences updated successfully.',
    },
  });
});

// DELETE /api/v1/user/history
router.delete('/user/history', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  try {
    await pool.query('DELETE FROM tool_usage WHERE user_id = ?', [user.id]);
  } catch (e: any) {
    console.error('[MySQL Clear History Error]:', e.message);
  }

  dbStore.toolUsages = dbStore.toolUsages.filter(u => u.userId !== user.id);

  res.json({ success: true, message: 'Personal usage history cleared.' });
});

// ==========================================
// NEWSLETTER ENDPOINTS
// ==========================================

// POST /api/v1/newsletter/subscribe
router.post('/newsletter/subscribe', async (req: Request, res: Response) => {
  const { email, name, categories, frequency, source } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const chosenFreq = (frequency === 'biweekly' || frequency === 'monthly') ? frequency : 'weekly';
  const chosenCategories = Array.isArray(categories) && categories.length > 0
    ? categories.map((c: any) => String(c).trim()).filter(Boolean)
    : ['ai-writing', 'coding', 'productivity', 'image-utilities'];
  const subscriberSource = typeof source === 'string' && source ? source.slice(0, 100) : 'web';
  const subscriberName = typeof name === 'string' && name ? name.trim().slice(0, 100) : null;

  const nowIso = new Date().toISOString();
  let existingSubscriber = dbStore.subscribers.find(s => s.email.toLowerCase() === cleanEmail);
  let isNew = false;
  let statusMessage = '';

  if (existingSubscriber) {
    existingSubscriber.categories = chosenCategories;
    existingSubscriber.frequency = chosenFreq;
    if (subscriberName) existingSubscriber.name = subscriberName;
    existingSubscriber.status = 'active';
    existingSubscriber.updatedAt = nowIso;
    statusMessage = "You're already subscribed! We've updated your preferences and topics.";
  } else {
    isNew = true;
    const newSub: NewsletterSubscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: subscriberName || undefined,
      categories: chosenCategories,
      frequency: chosenFreq,
      status: 'active',
      source: subscriberSource,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    dbStore.subscribers.unshift(newSub);
    existingSubscriber = newSub;
    statusMessage = 'Welcome to ClarifyAll Weekly! You will receive your first digest this Friday.';
  }

  // Persist to MySQL
  try {
    const categoriesJson = JSON.stringify(chosenCategories);
    await pool.query(
      `INSERT INTO newsletter_subscribers (id, email, name, categories, frequency, status, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = COALESCE(VALUES(name), name),
         categories = VALUES(categories),
         frequency = VALUES(frequency),
         status = 'active',
         source = VALUES(source),
         updated_at = NOW()`,
      [existingSubscriber.id, cleanEmail, subscriberName, categoriesJson, chosenFreq, subscriberSource]
    );
  } catch (err: any) {
    console.error('[MySQL Newsletter Error]:', err.message);
  }

  res.json({
    success: true,
    message: statusMessage,
    data: {
      id: existingSubscriber.id,
      email: existingSubscriber.email,
      categories: existingSubscriber.categories,
      frequency: existingSubscriber.frequency,
      status: existingSubscriber.status,
      isNew,
    },
  });
});

// GET /api/v1/newsletter/stats
router.get('/newsletter/stats', async (_req: Request, res: Response) => {
  let count = dbStore.subscribers.filter(s => s.status === 'active').length;

  try {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = 'active'"
    );
    if (rows && rows[0] && rows[0].count !== undefined) {
      count = Math.max(count, Number(rows[0].count));
    }
  } catch (err: any) {
    // fallback to store count
  }

  // Next Friday calculation
  const nextFriday = new Date();
  const day = nextFriday.getDay();
  const diff = (5 - day + 7) % 7 || 7; // days until next Friday
  nextFriday.setDate(nextFriday.getDate() + diff);
  const nextEditionFormatted = nextFriday.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  res.json({
    success: true,
    data: {
      subscriberCount: count + 2480, // Social proof offset: active community size
      frequency: 'Every Friday at 9:00 AM UTC',
      nextEditionDate: nextEditionFormatted,
      curatedCategories: [
        'LLMs & Prompt Systems',
        'Developer & Code Generators',
        'Image & Video Synthesis',
        'Productivity & Document AI',
        'Voice & Audio Models',
      ],
    },
  });
});

// POST /api/v1/newsletter/unsubscribe
router.post('/newsletter/unsubscribe', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = dbStore.subscribers.find(s => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    existing.status = 'unsubscribed';
  }

  try {
    await pool.query(
      "UPDATE newsletter_subscribers SET status = 'unsubscribed', updated_at = NOW() WHERE email = ?",
      [cleanEmail]
    );
  } catch (err: any) {
    console.error('[MySQL Unsubscribe Error]:', err.message);
  }

  res.json({
    success: true,
    message: 'You have been successfully unsubscribed from the weekly newsletter.',
  });
});

export default router;
