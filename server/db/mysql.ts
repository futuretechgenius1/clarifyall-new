import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST || 'srv1148.hstgr.io',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'u530425252_clarifyall',
  password: process.env.DB_PASSWORD || '&631^1HXVzqE',
  database: process.env.DB_NAME || 'u530425252_clarifyall',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

export const pool = mysql.createPool(dbConfig);

/**
 * Initialize and verify all necessary MySQL tables in u530425252_clarifyall
 */
export async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log(`[MySQL] Successfully connected to host: ${dbConfig.host}, database: ${dbConfig.database}`);

    // 1. Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'ANALYST') NOT NULL DEFAULT 'EDITOR',
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Utility tools table (named clarify_utilities to preserve existing directory 'tools' table)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS clarify_utilities (
        id VARCHAR(64) PRIMARY KEY,
        category_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        icon VARCHAR(100) NOT NULL,
        seo_title VARCHAR(255) NULL,
        seo_description TEXT NULL,
        intro_content TEXT NOT NULL,
        how_to_content TEXT NOT NULL,
        faq_json JSON NULL,
        related_tools JSON NULL,
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_util_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Articles (Guides, Blogs, Prompts)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(64) PRIMARY KEY,
        author_id VARCHAR(64) NULL,
        author_name VARCHAR(255) NOT NULL DEFAULT 'Editorial Staff',
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        body MEDIUMTEXT NOT NULL,
        featured_image VARCHAR(512) NULL,
        seo_title VARCHAR(255) NULL,
        seo_description TEXT NULL,
        canonical_url VARCHAR(512) NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'guide',
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_art_slug (slug),
        INDEX idx_art_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Tool Usage logging
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tool_usage (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NULL,
        tool_slug VARCHAR(100) NOT NULL,
        operation VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        processing_duration_ms INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_usage_created (created_at),
        INDEX idx_usage_tool (tool_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. AI Provider Usage & Cost tracking
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_usage (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NULL,
        provider VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        operation VARCHAR(100) NOT NULL,
        input_tokens INT NULL,
        output_tokens INT NULL,
        estimated_cost DECIMAL(10, 6) NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Site Settings
    await conn.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(64) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Ad Slots
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ad_slots (
        id VARCHAR(64) PRIMARY KEY,
        slot_key VARCHAR(100) NOT NULL UNIQUE,
        placement VARCHAR(100) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT FALSE,
        configuration JSON NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Audit Logs
    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NULL,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entity_id VARCHAR(64) NULL,
        details TEXT NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_time (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. User Favorites table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        tool_slug VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_tool (user_id, tool_slug),
        INDEX idx_fav_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. User Preferences table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR(64) PRIMARY KEY,
        default_theme VARCHAR(20) NOT NULL DEFAULT 'light',
        email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        anonymous_telemetry BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. Tool Ratings and Reviews table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tool_reviews (
        id VARCHAR(64) PRIMARY KEY,
        tool_slug VARCHAR(100) NOT NULL,
        user_id VARCHAR(64) NULL,
        user_name VARCHAR(255) NOT NULL,
        rating TINYINT NOT NULL,
        title VARCHAR(255) NULL,
        comment TEXT NOT NULL,
        pros TEXT NULL,
        cons TEXT NULL,
        verified_user BOOLEAN NOT NULL DEFAULT FALSE,
        helpful_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rev_tool (tool_slug),
        INDEX idx_rev_tool_created (tool_slug, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. Newsletter subscribers table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NULL,
        categories JSON NULL,
        frequency VARCHAR(50) NOT NULL DEFAULT 'weekly',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        source VARCHAR(100) NOT NULL DEFAULT 'web',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sub_email (email),
        INDEX idx_sub_status (status),
        INDEX idx_sub_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 13. User AI Tool Bookmarks table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_ai_bookmarks (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        tool_slug VARCHAR(100) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_ai_bm (user_id, tool_slug),
        INDEX idx_ai_bm_user (user_id),
        INDEX idx_ai_bm_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    conn.release();
    console.log('[MySQL] All database tables successfully initialized and synced on Hostinger.');
    return true;
  } catch (error: any) {
    console.error('[MySQL Error] Could not initialize database:', error.message);
    return false;
  }
}
