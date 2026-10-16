# ClarifyAll.com — AI. Made Clear.

> Production-ready, mobile-first AI utilities and productivity platform.

ClarifyAll delivers high-performance, accessible, and privacy-conscious online utilities—including PDF document management, image compression and conversion, computer vision OCR, and intelligent writing assistants—built for search engine discoverability and frictionless user utility.

---

## 1. Architecture Overview

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS v4 with mobile-first responsive breakpoints (320px fluid layouts, zero horizontal overflow)
- **Icons:** Lucide React
- **SEO & Social:** Dynamic server-rendered HTML tags (`<title>`, `<meta name="description">`, `og:*`, `twitter:*`, canonical URLs) + Schema.org JSON-LD structured data

### Backend
- **Runtime:** Node.js with TypeScript (`tsx` execution)
- **Server:** Express.js mounted at root with Vite middleware in dev (`server.ts`)
- **API Versioning:** REST API under `/api/v1`
- **AI Engine:** Google Gemini 3.8 Flash via `@google/genai` SDK with fallback adapters
- **PDF Engine:** Native `pdf-lib` document manipulation (object stream stripping, compression, merging, range splitting)
- **Image Engine:** Canvas hardware acceleration for client conversions + server vision OCR
- **Security:** Helmet-style security headers, CORS allowlisting, input validation, server-authoritative RBAC (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `ANALYST`)

### Database & Persistence
- **Production Engine:** MySQL 8 (`utf8mb4_unicode_ci`, UTC timestamps)
- **ORM Schema:** Prisma schema in `prisma/schema.prisma`
- **DDL & Seed:** Complete DDL script in `database/schema.sql`
- **Development/Sandbox Layer:** In-memory & file-synced data store in `server/db/store.ts` ensuring 100% out-of-the-box functionality without external infrastructure dependencies

---

## 2. Directory Structure

```text
clarifyall/
├── database/
│   └── schema.sql             # MySQL 8 DDL with foreign keys and indexes
├── prisma/
│   └── schema.prisma          # Production Prisma ORM schema
├── server/
│   ├── ai/
│   │   └── provider.ts        # Provider-independent AI service (Gemini 3.8 Flash)
│   ├── db/
│   │   └── store.ts           # Normalized database store & seed data
│   ├── middleware/
│   │   └── auth.ts            # RBAC authorization middleware
│   ├── routes/
│   │   └── v1.ts              # Express API endpoints (/api/v1/*)
│   └── tools/
│       └── pdfEngine.ts       # Real PDF compression, merge, and split logic
├── src/
│   ├── components/            # Header, Footer, Breadcrumbs, ToolCard, AdSlot, SEOHead, SearchModal
│   ├── context/
│   │   └── AppContext.tsx     # Theme, mobile menu, search, and RBAC test state
│   ├── pages/                 # HomePage, ToolsPage, CategoryDetailPage, AIToolsPage, AdminPage, etc.
│   ├── tools/                 # Interactive tool components for all 14 utilities
│   ├── types/                 # TypeScript interfaces
│   ├── App.tsx                # App router table
│   └── main.tsx               # Client entry point
├── Dockerfile                 # Multi-stage production container build
├── docker-compose.yml         # Compose stack with MySQL 8 & ClarifyAll service
├── server.ts                  # Full-stack server entry point (port 3000)
└── metadata.json              # Applet capabilities & manifest
```

---

## 3. Included Utilities

1. **PDF Compressor:** Rebuilds PDF object streams and optimizes embedded assets without corrupting vector outlines.
2. **PDF Merger:** Merges multiple PDF files with drag-and-drop and up/down reordering.
3. **PDF Splitter:** Extracts customized page numbers and hyphenated ranges (`1-3, 5, 8-10`).
4. **PDF to Image:** Converts PDF pages to crisp PNG or JPEG images.
5. **Image to Text (OCR):** Extracts text from screenshots, documents, and whiteboard photos using AI Vision.
6. **Image Compressor:** Fine-grained quality slider (30%–95%) with live savings calculation and preview.
7. **Image Resizer:** Pixel-precise scaling with aspect-ratio lock and social presets (Square, Full HD, Banner).
8. **Image Converter:** Converts seamlessly between WebP, PNG, and JPEG.
9. **Word Counter & Analyzer:** Real-time word, character, sentence, paragraph, reading, and speaking durations.
10. **Text Formatter:** Transforms text to AP Title Case, UPPERCASE, lowercase, sentence case, camelCase, slugify, and cleans redundant whitespace.
11. **AI Email Writer:** Generates polished executive emails based on purpose, audience, and customizable tone.
12. **AI Text Summarizer:** Condenses long articles into Key Bullet Points, Executive Memos, or concise TL;DRs.
13. **Resume Bullet Improver:** Applies the Google XYZ formula (*Accomplished [X] as measured by [Y] by doing [Z]*).
14. **AI Prompt Generator:** Crafts structured system prompts with explicit persona, objectives, and guardrails.

---

## 4. Getting Started

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (copy from .env.example)
cp .env.example .env

# 3. Start development server (Express + Vite on port 3000)
npm run dev
```

### Running with Docker Compose (MySQL 8)
```bash
docker-compose up --build
```
Access the application at `http://localhost:3000`.

---

## 5. Technical SEO & Prerendering

- **Dynamic SSR Injection:** `server.ts` intercepts HTML document requests and dynamically populates `<title>`, `<meta name="description">`, `og:title`, `og:description`, and `<link rel="canonical">` before sending the response to clients or crawlers.
- **Sitemap Index:** Accessible at `/sitemap.xml` with automatic URL updates for tools, categories, articles, and directory items.
- **Robots.txt:** Accessible at `/robots.txt` with directives preventing indexing of administrative and API routes.
- **Structured Data:** Schema.org `WebApplication`, `WebSite`, `BreadcrumbList`, and `Article` JSON-LD blocks.

---

## 6. Security, RBAC & Privacy Disclosures

- **Role-Based Access Control:** Supported roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `ANALYST`. Enforced server-side via `server/middleware/auth.ts`.
- **Volatile Execution:** Uploaded files for PDF and image operations exist only in memory during processing and are immediately discarded.
- **Client Processing:** Text utilities (Word Counter, Formatter) and basic resizing execute 100% locally in the browser sandbox.
- **Monetization Ethics:** Ad slots are configurable via the Admin dashboard and disabled by default until verified through an approved publisher account.
