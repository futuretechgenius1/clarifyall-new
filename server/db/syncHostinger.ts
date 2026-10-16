import { pool, initDatabase } from './mysql.js';
import { dbStore } from './store.js';

export async function syncWithHostinger() {
  const ready = await initDatabase();
  if (!ready) return;

  try {
    const conn = await pool.getConnection();

    // 1. Ingest existing AI categories from Hostinger database
    try {
      const [hostingerCats]: any = await conn.query('SELECT id, name, slug, description FROM categories');
      if (Array.isArray(hostingerCats) && hostingerCats.length > 0) {
        console.log(`[MySQL] Ingesting ${hostingerCats.length} existing categories from Hostinger...`);
        for (const hc of hostingerCats) {
          const exists = dbStore.categories.some(c => c.slug === hc.slug);
          if (!exists) {
            dbStore.categories.push({
              id: `cat_h_${hc.id}`,
              name: hc.name,
              slug: hc.slug,
              description: hc.description || `AI directory tools in ${hc.name}`,
              icon: 'Compass',
              status: 'PUBLISHED',
            });
          }
        }
      }
    } catch (e: any) {
      console.log('[MySQL] Note on categories:', e.message);
    }

    // 2. Ingest existing AI Tools directory from Hostinger
    try {
      const [hostingerTools]: any = await conn.query('SELECT id, name, website_url, short_description, full_description, pricing_model FROM tools');
      if (Array.isArray(hostingerTools) && hostingerTools.length > 0) {
        console.log(`[MySQL] Ingesting ${hostingerTools.length} existing directory tools from Hostinger...`);
        for (const ht of hostingerTools) {
          const slug = ht.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
          const exists = dbStore.aiTools.some(at => at.slug === slug);
          if (!exists) {
            dbStore.aiTools.push({
              id: `aitool_h_${ht.id}`,
              name: ht.name,
              slug,
              vendorUrl: ht.website_url || 'https://clarifyall.com',
              description: ht.short_description || ht.full_description || `${ht.name} artificial intelligence utility`,
              categories: ['AI Directory'],
              pricingModel: ht.pricing_model || 'Freemium',
              features: ['Web interface', 'Cloud processing', 'Productivity enhancement'],
              limitations: ['Network connection required'],
              reviewContent: ht.full_description || `${ht.name} verified in the ClarifyAll AI tool directory.`,
              lastVerifiedAt: new Date().toISOString(),
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e: any) {
      console.log('[MySQL] Note on tools:', e.message);
    }

    // 3. Seed clarify_utilities into MySQL if empty
    try {
      const [countRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM clarify_utilities');
      if (countRows[0].cnt === 0) {
        console.log('[MySQL] Seeding 14 utilities into clarify_utilities table...');
        for (const t of dbStore.tools) {
          await conn.query(
            `INSERT INTO clarify_utilities (id, category_id, name, slug, description, icon, seo_title, seo_description, intro_content, how_to_content, faq_json, related_tools, status, is_featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              t.id,
              t.categoryId,
              t.name,
              t.slug,
              t.description,
              t.icon,
              t.seoTitle,
              t.seoDescription,
              t.introContent,
              t.howToContent,
              JSON.stringify(t.faqJson),
              JSON.stringify(t.relatedTools),
              t.status,
              t.isFeatured ? 1 : 0,
            ]
          );
        }
      }
    } catch (e: any) {
      console.log('[MySQL] Note on clarify_utilities seed:', e.message);
    }

    // 4. Seed articles into MySQL if empty
    try {
      const [artRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM articles');
      if (artRows[0].cnt === 0) {
        console.log('[MySQL] Seeding editorial articles into Hostinger database...');
        for (const a of dbStore.articles) {
          await conn.query(
            `INSERT INTO articles (id, author_id, author_name, title, slug, excerpt, body, seo_title, seo_description, canonical_url, type, status, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              a.id,
              a.authorId,
              a.authorName,
              a.title,
              a.slug,
              a.excerpt,
              a.body,
              a.seoTitle,
              a.seoDescription,
              a.canonicalUrl,
              a.type,
              a.status,
            ]
          );
        }
      }
    } catch (e: any) {
      console.log('[MySQL] Note on articles seed:', e.message);
    }

    conn.release();
  } catch (err: any) {
    console.error('[MySQL Error] Sync error:', err.message);
  }
}
