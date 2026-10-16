// ClarifyAll Database Store & Seed Data
// Normalized schema compatible with MySQL 8 / Prisma

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'ANALYST';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface Tool {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  seoTitle: string;
  seoDescription: string;
  introContent: string;
  howToContent: string;
  faqJson: ToolFAQ[];
  relatedTools: string[]; // slugs
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage?: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  type: 'guide' | 'blog' | 'prompt';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiToolDirectoryItem {
  id: string;
  name: string;
  slug: string;
  vendorUrl: string;
  description: string;
  categories: string[];
  pricingModel: string; // 'Free' | 'Freemium' | 'Paid' | 'Open Source'
  features: string[];
  limitations: string[];
  reviewContent: string;
  lastVerifiedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ToolUsageRecord {
  id: string;
  userId?: string;
  toolId: string;
  toolSlug: string;
  operation: string;
  status: 'SUCCESS' | 'ERROR';
  processingDurationMs: number;
  createdAt: string;
}

export interface AiUsageRecord {
  id: string;
  userId?: string;
  provider: string;
  model: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  status: 'SUCCESS' | 'ERROR';
  createdAt: string;
}

export interface SiteSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  updatedAt: string;
}

export interface AdSlot {
  id: string;
  slotKey: string;
  placement: string;
  enabled: boolean;
  configuration: Record<string, any>;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ToolReview {
  id: string;
  toolSlug: string;
  userId?: string | null;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
  verifiedUser?: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  categories: string[];
  frequency: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAiBookmark {
  id: string;
  userId: string;
  toolSlug: string;
  notes?: string;
  createdAt: string;
}

// In-Memory Database Store with Seed Data
class DatabaseStore {
  users: User[] = [
    {
      id: 'usr_admin_1',
      name: 'System Administrator',
      email: 'admin@clarifyall.com',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_editor_1',
      name: 'Senior Editorial Staff',
      email: 'editor@clarifyall.com',
      role: 'EDITOR',
      status: 'ACTIVE',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-01-05T00:00:00Z',
    },
  ];

  categories: Category[] = [
    {
      id: 'cat_pdf',
      name: 'PDF & Documents',
      slug: 'pdf-documents',
      description: 'Compress, merge, split, and convert PDF documents quickly and securely without installing bulky software.',
      icon: 'FileText',
      seoTitle: 'Free PDF Tools & Online Document Utilities – ClarifyAll',
      seoDescription: 'Merge multiple PDFs, compress file size without losing quality, split pages, and convert documents online for free.',
      status: 'PUBLISHED',
    },
    {
      id: 'cat_images',
      name: 'Image Utilities',
      slug: 'image-utilities',
      description: 'Compress, resize, convert, and extract text from images right in your browser or with fast server-side processing.',
      icon: 'Image',
      seoTitle: 'Free Online Image Tools: Compress, Resize, Convert, OCR – ClarifyAll',
      seoDescription: 'Optimize JPEG, PNG, and WebP images. Reduce file sizes, convert formats, and extract OCR text online.',
      status: 'PUBLISHED',
    },
    {
      id: 'cat_ai_writing',
      name: 'AI Writing & Assistance',
      slug: 'ai-writing',
      description: 'Draft polished emails, summarize long articles, and generate structured prompts with intelligent AI assistance.',
      icon: 'Sparkles',
      seoTitle: 'Free AI Writing Utilities & Productivity Assistants – ClarifyAll',
      seoDescription: 'Compose professional emails, summarize long text blocks, and create high-performing prompts with free AI tools.',
      status: 'PUBLISHED',
    },
    {
      id: 'cat_text',
      name: 'Text & Formatting',
      slug: 'text-tools',
      description: 'Count words, analyze reading time, change letter casing, and clean up formatting instantly with zero latency.',
      icon: 'Type',
      seoTitle: 'Free Online Word Counter & Text Formatter – ClarifyAll',
      seoDescription: 'Real-time word counter, character counter, sentence analysis, case conversions, and whitespace cleanup.',
      status: 'PUBLISHED',
    },
    {
      id: 'cat_career',
      name: 'Career & Resume',
      slug: 'career-resume',
      description: 'Transform weak resume bullet points into punchy, metric-driven achievements that pass applicant tracking systems.',
      icon: 'Briefcase',
      seoTitle: 'Free AI Resume Bullet Improver & Career Utilities – ClarifyAll',
      seoDescription: 'Elevate your resume bullets with action verbs, quantifiable metrics, and impact-focused language.',
      status: 'PUBLISHED',
    },
    {
      id: 'cat_prompts',
      name: 'AI Prompts & Discovery',
      slug: 'ai-prompts',
      description: 'Explore curated system prompts, roleplay blueprints, and comprehensive guides for frontier language models.',
      icon: 'Compass',
      seoTitle: 'Curated AI Prompts & Blueprints Directory – ClarifyAll',
      seoDescription: 'Free tested system prompts for coding, content writing, analysis, and problem-solving.',
      status: 'PUBLISHED',
    },
  ];

  tools: Tool[] = [
    {
      id: 'tool_pdf_compressor',
      categoryId: 'cat_pdf',
      name: 'PDF Compressor',
      slug: 'pdf-compressor',
      description: 'Reduce the file size of your PDF documents while maintaining optimal visual clarity for emailing and uploading.',
      icon: 'Minimize2',
      seoTitle: 'Free PDF Compressor Online – Reduce PDF File Size | ClarifyAll',
      seoDescription: 'Compress PDF files online for free. Shrink document size with smart object stream optimization without compromising readability.',
      introContent: 'Large PDF documents can exceed email attachment limits or slow down portal uploads. ClarifyAll PDF Compressor analyzes the internal structure of your document, strips redundant metadata, flattens unused streams, and optimizes objects to deliver a lightweight, high-fidelity PDF.',
      howToContent: '1. Upload or drag and drop your PDF file (up to 25 MB).\n2. Our engine inspects stream definitions and optimizes internal resources.\n3. Preview the original vs compressed file size and the exact percentage saved.\n4. Click "Download Compressed PDF" to save the file directly to your device.',
      faqJson: [
        {
          question: 'Are my uploaded PDFs stored permanently?',
          answer: 'No. ClarifyAll processes your files in volatile memory or temporary storage and deletes them immediately upon completion. We never store or inspect your private document contents.'
        },
        {
          question: 'Will compressing my PDF reduce text readability?',
          answer: 'No. Text vector outlines and fonts are preserved intact. Compression focuses on deduplicating metadata, stripping unreferenced font subsets, and optimizing embedded image structures.'
        },
        {
          question: 'Is there a limit on file size?',
          answer: 'Free guest uploads support files up to 25 MB and up to 100 pages, which covers virtually all typical contracts, resumes, reports, and ebooks.'
        }
      ],
      relatedTools: ['pdf-merge', 'pdf-split', 'pdf-to-image'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_pdf_merge',
      categoryId: 'cat_pdf',
      name: 'PDF Merger',
      slug: 'pdf-merge',
      description: 'Combine multiple PDF files into a single organized document. Easily drag to reorder pages before merging.',
      icon: 'Layers',
      seoTitle: 'Free PDF Merger Online – Combine PDF Files | ClarifyAll',
      seoDescription: 'Merge multiple PDF files into one clean document online. Reorder files with an intuitive drag-and-drop interface.',
      introContent: 'Consolidate multiple scanned receipts, invoices, presentation slides, or book chapters into a single coherent PDF document. Our fast PDF merger preserves bookmark structures, page orientations, and form fields.',
      howToContent: '1. Click "Select PDF Files" or drop multiple files into the dropzone.\n2. Reorder your files using the up/down controls to specify the sequence.\n3. Click "Merge PDFs" to process the combined document.\n4. Download your merged PDF with one click.',
      faqJson: [
        {
          question: 'How many files can I merge at once?',
          answer: 'You can merge up to 15 PDF files in a single batch, up to a total combined size of 50 MB.'
        },
        {
          question: 'Can I reorder files before merging?',
          answer: 'Yes! ClarifyAll lets you drag or use arrow buttons to arrange documents in the exact sequence you want them to appear in the final file.'
        }
      ],
      relatedTools: ['pdf-compressor', 'pdf-split'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_pdf_split',
      categoryId: 'cat_pdf',
      name: 'PDF Splitter',
      slug: 'pdf-split',
      description: 'Extract specific pages or page ranges from a large PDF document into a new standalone PDF file.',
      icon: 'Scissors',
      seoTitle: 'Free PDF Splitter Online – Extract Pages from PDF | ClarifyAll',
      seoDescription: 'Split large PDF documents online for free. Specify exact page numbers or ranges (e.g. 1-3, 5, 8-10) and download instantly.',
      introContent: 'Extract only the relevant pages from lengthy manuals, statements, contracts, or scanned packets. Enter flexible page ranges like "1-3, 7, 10-12" to generate a tailored document without losing resolution.',
      howToContent: '1. Upload the PDF file you wish to split.\n2. Specify the page ranges you want to extract (e.g., 1-5, 8).\n3. Verify the page count and target selections.\n4. Click "Split PDF" and download the freshly extracted document.',
      faqJson: [
        {
          question: 'What page range syntax is supported?',
          answer: 'You can use individual page numbers like "1, 4, 7" or hyphenated ranges like "2-6". You can also combine them freely (e.g., "1, 3-5, 9").'
        },
        {
          question: 'Does splitting affect document quality?',
          answer: 'Not at all. ClarifyAll extracts native PDF page trees without re-encoding, ensuring crystal-clear vector fonts and high-res imagery remain identical.'
        }
      ],
      relatedTools: ['pdf-merge', 'pdf-compressor'],
      status: 'PUBLISHED',
      isFeatured: false,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_pdf_to_image',
      categoryId: 'cat_pdf',
      name: 'PDF to Image Converter',
      slug: 'pdf-to-image',
      description: 'Convert PDF pages into high-resolution PNG or JPEG images for presentations, web publishing, or sharing.',
      icon: 'FileImage',
      seoTitle: 'Free PDF to Image Converter – Convert PDF to PNG / JPG | ClarifyAll',
      seoDescription: 'Convert PDF documents into crisp PNG or JPEG images online. Fast, high-resolution rendering with zero watermark.',
      introContent: 'Need to insert a PDF invoice, diagram, or certificate into a presentation, blog post, or chat? Our PDF to Image converter renders crisp, high-DPI raster representations of your document pages.',
      howToContent: '1. Upload your PDF document.\n2. Choose your preferred output format (PNG or JPEG) and resolution density.\n3. Click "Convert to Images" to render the pages.\n4. Download individual page images or the entire set.',
      faqJson: [
        {
          question: 'What image format is best for PDF conversion?',
          answer: 'PNG is ideal for documents with sharp typography, line art, and diagrams. JPEG is better for documents featuring photographic spreads due to smaller file sizes.'
        }
      ],
      relatedTools: ['image-to-text', 'pdf-compressor'],
      status: 'PUBLISHED',
      isFeatured: false,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_image_to_text',
      categoryId: 'cat_images',
      name: 'Image to Text (OCR)',
      slug: 'image-to-text',
      description: 'Extract editable text from photos, scans, receipts, diagrams, and screenshots using advanced OCR intelligence.',
      icon: 'ScanText',
      seoTitle: 'Free Online OCR – Extract Text from Images & Screenshots | ClarifyAll',
      seoDescription: 'Extract text from images, photos, and screenshots online for free. Optical Character Recognition (OCR) powered by state-of-the-art AI.',
      introContent: 'Stop retyping text from paper notes, book photos, error dialogs, whiteboard brainstorms, or invoices. ClarifyAll uses optical character recognition to extract paragraphs, tabular data, and alphanumeric strings with high accuracy.',
      howToContent: '1. Upload an image (PNG, JPEG, WebP) or paste from your clipboard.\n2. Click "Extract Text with OCR".\n3. View the extracted text in the editable result box.\n4. Copy to your clipboard or download as a .txt file.',
      faqJson: [
        {
          question: 'Can it read handwriting?',
          answer: 'ClarifyAll OCR performs best on printed fonts, digital screenshots, and neat, legible handwriting.'
        },
        {
          question: 'What image formats are supported?',
          answer: 'We support PNG, JPEG, WebP, GIF, and standard smartphone camera photo formats up to 15 MB.'
        }
      ],
      relatedTools: ['image-compressor', 'word-counter', 'text-summarizer'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_image_compressor',
      categoryId: 'cat_images',
      name: 'Image Compressor',
      slug: 'image-compressor',
      description: 'Compress JPEG, PNG, and WebP images to drastically reduce file sizes while maintaining beautiful visual fidelity.',
      icon: 'ImageDown',
      seoTitle: 'Free Image Compressor Online – Compress JPG, PNG, WebP | ClarifyAll',
      seoDescription: 'Compress images online for free. Reduce image file size by up to 80% while retaining sharp clarity. Fast, browser-assisted compression.',
      introContent: 'Fast-loading websites and responsive mobile apps require optimized image assets. ClarifyAll Image Compressor gives you granular quality controls to shed megabytes off your photos and graphics without visible artifacts.',
      howToContent: '1. Select or drop your JPEG, PNG, or WebP image.\n2. Adjust the compression quality slider (recommended: 75% - 85%).\n3. Compare original file size with the optimized output size in real time.\n4. Click "Download Compressed Image".',
      faqJson: [
        {
          question: 'Does compression happen in my browser?',
          answer: 'Yes! For optimal privacy and speed, image compression uses your local hardware canvas acceleration with zero server latency.'
        },
        {
          question: 'Which format achieves the highest compression?',
          answer: 'WebP typically achieves 25–35% smaller file sizes than standard JPEG at equivalent visual quality.'
        }
      ],
      relatedTools: ['image-resizer', 'image-converter', 'image-to-text'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_image_resizer',
      categoryId: 'cat_images',
      name: 'Image Resizer',
      slug: 'image-resizer',
      description: 'Resize images to custom width and height dimensions with automatic aspect ratio locking or custom presets.',
      icon: 'Maximize',
      seoTitle: 'Free Image Resizer Online – Change Image Dimensions | ClarifyAll',
      seoDescription: 'Resize photos and graphics online. Scale pixel dimensions, maintain aspect ratios, or crop to social media dimensions easily.',
      introContent: 'Whether resizing photos for YouTube thumbnails, Instagram posts, passport forms, or ecommerce listings, our Image Resizer accurately resamples pixel grids with smooth bilinear interpolation.',
      howToContent: '1. Upload your image.\n2. Enter your desired width or height, or pick a popular preset (Full HD, Square, Banner).\n3. Keep "Maintain Aspect Ratio" checked to avoid distortion.\n4. Download the resized image.',
      faqJson: [
        {
          question: 'Will resizing stretch my image?',
          answer: 'By default, the aspect ratio lock is enabled, automatically calculating the corresponding height when you adjust width (or vice versa).'
        }
      ],
      relatedTools: ['image-compressor', 'image-converter'],
      status: 'PUBLISHED',
      isFeatured: false,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_image_converter',
      categoryId: 'cat_images',
      name: 'Image Converter',
      slug: 'image-converter',
      description: 'Convert image files seamlessly between WebP, PNG, and JPEG formats in seconds.',
      icon: 'RefreshCw',
      seoTitle: 'Free Image Converter Online – Convert PNG, JPG, WebP | ClarifyAll',
      seoDescription: 'Convert images to WebP, PNG, or JPEG format online for free. Clean conversion with transparency retention for PNG and WebP.',
      introContent: 'Modern web formats like WebP offer superior compression, while PNG is crucial for transparency. Convert your images to any required standard without needing heavyweight graphic design software.',
      howToContent: '1. Upload an image in any format.\n2. Select your target format: WebP, PNG, or JPEG.\n3. Click "Convert Image".\n4. Download your new image file instantly.',
      faqJson: [
        {
          question: 'Does converting to WebP preserve transparent backgrounds?',
          answer: 'Yes! Both PNG and WebP support alpha transparency channels, which will be preserved seamlessly during conversion.'
        }
      ],
      relatedTools: ['image-compressor', 'image-resizer'],
      status: 'PUBLISHED',
      isFeatured: false,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_word_counter',
      categoryId: 'cat_text',
      name: 'Word Counter & Analyzer',
      slug: 'word-counter',
      description: 'Calculate real-time word count, character count, sentence structure, estimated reading time, and speaking time.',
      icon: 'Hash',
      seoTitle: 'Free Word Counter Online – Characters, Reading Time & Density | ClarifyAll',
      seoDescription: 'Accurate word count and character count tool with real-time statistics. Calculate sentence count, paragraph count, and speaking duration.',
      introContent: 'Keep your essays, tweets, blog articles, and video scripts within strict word and character limits. ClarifyAll Word Counter computes deterministic text statistics as you type, with zero lag and total privacy.',
      howToContent: '1. Type or paste your text into the editor.\n2. Instantly view real-time metrics: words, characters, sentences, paragraphs, and reading time.\n3. Use quick-action buttons to copy or clear your text.',
      faqJson: [
        {
          question: 'How is reading time calculated?',
          answer: 'Reading time is calculated using the industry-standard average reading speed of 225 words per minute. Speaking time is based on 130 words per minute.'
        },
        {
          question: 'Is my text sent to a server?',
          answer: 'No. The Word Counter runs entirely in your web browser. Your text never leaves your device.'
        }
      ],
      relatedTools: ['text-formatter', 'text-summarizer'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_text_formatter',
      categoryId: 'cat_text',
      name: 'Text Formatter & Case Converter',
      slug: 'text-formatter',
      description: 'Transform text case (UPPERCASE, lowercase, Title Case, Sentence case, camelCase, slugify) and clean up excess whitespace.',
      icon: 'AlignLeft',
      seoTitle: 'Free Online Text Formatter & Case Converter | ClarifyAll',
      seoDescription: 'Convert text between uppercase, lowercase, title case, sentence case, camelCase, kebab-case, and strip redundant line breaks.',
      introContent: 'Clean up poorly formatted copy, convert headlines to AP Title Case, generate URL-friendly slugs, or remove stubborn double spaces and weird line breaks with one click.',
      howToContent: '1. Paste your raw text into the input field.\n2. Choose a transformation: Title Case, UPPERCASE, lowercase, Sentence case, camelCase, or Slugify.\n3. Click "Clean Whitespace" to trim excess tabs and spaces.\n4. Copy the formatted result to your clipboard.',
      faqJson: [
        {
          question: 'Does the Title Case formatter follow AP style rules?',
          answer: 'Yes. Articles (a, an, the), coordinating conjunctions (and, but, for), and short prepositions are automatically left in lowercase unless they begin the sentence.'
        }
      ],
      relatedTools: ['word-counter', 'ai-prompt-generator'],
      status: 'PUBLISHED',
      isFeatured: false,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_ai_email_writer',
      categoryId: 'cat_ai_writing',
      name: 'AI Email Writer',
      slug: 'ai-email-writer',
      description: 'Generate polished, context-aware emails for business inquiries, follow-ups, negotiations, and formal communications.',
      icon: 'Mail',
      seoTitle: 'Free AI Email Writer Online – Professional Email Generator | ClarifyAll',
      seoDescription: 'Generate articulate, professional emails in seconds with AI. Customize purpose, recipient, tone, and key bullets for effective communication.',
      introContent: 'Never struggle with writer\'s block on important emails again. Whether following up with a hiring manager, pitching a prospective client, or requesting a deadline extension, ClarifyAll AI Email Writer drafts articulate, courteous correspondence.',
      howToContent: '1. Enter the purpose of your email (e.g. "Follow up after second interview").\n2. Specify the recipient / audience and choose your tone (Professional, Warm, Concise, Direct, Urgent).\n3. List key points or bullet points to include.\n4. Click "Generate Email" and copy or tweak the result.',
      faqJson: [
        {
          question: 'Can I regenerate if I want a different phrasing?',
          answer: 'Yes! Simply click "Regenerate" or adjust the tone selector to see alternative versions.'
        },
        {
          question: 'Is my email draft private?',
          answer: 'Yes. ClarifyAll does not store your email prompts or outputs permanently in any marketing database.'
        }
      ],
      relatedTools: ['text-summarizer', 'resume-bullet-improver'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_text_summarizer',
      categoryId: 'cat_ai_writing',
      name: 'AI Text Summarizer',
      slug: 'text-summarizer',
      description: 'Condense articles, research papers, reports, and long memos into concise, easy-to-digest summaries and takeaways.',
      icon: 'FileSpreadsheet',
      seoTitle: 'Free AI Text Summarizer Online – Condense Articles & Reports | ClarifyAll',
      seoDescription: 'Summarize lengthy text, articles, and documents online for free. Choose bullet points, executive summaries, or quick overviews.',
      introContent: 'Save hours of reading time. Paste long research findings, news articles, customer transcripts, or legal agreements to extract primary theses, core arguments, and action items in seconds.',
      howToContent: '1. Paste your article, report, or text into the input field.\n2. Select your desired summary mode: "Key Bullet Points", "Executive Overview", or "Concise TL;DR".\n3. Click "Summarize Content".\n4. Read or copy the extracted summary.',
      faqJson: [
        {
          question: 'Does the summarizer make up facts?',
          answer: 'Our prompt constraints strictly instruct the AI model to stick exclusively to facts mentioned in the provided source text and avoid external hallucination.'
        },
        {
          question: 'What is the maximum text length?',
          answer: 'You can paste up to 10,000 words per summarization request.'
        }
      ],
      relatedTools: ['word-counter', 'ai-email-writer'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_resume_bullet_improver',
      categoryId: 'cat_career',
      name: 'Resume Bullet Improver',
      slug: 'resume-bullet-improver',
      description: 'Transform passive resume duties into high-impact, metric-focused achievement statements that impress recruiters.',
      icon: 'Award',
      seoTitle: 'Free AI Resume Bullet Improver – Optimize Resume Statements | ClarifyAll',
      seoDescription: 'Level up your resume bullets with strong action verbs, quantifiable metrics, and business impact. Free career utility by ClarifyAll.',
      introContent: 'Recruiters and hiring managers spend an average of 6 seconds skimming a resume. Passive lines like "Responsible for managing social media" fail to stand out. Our tool rewires your bullets using the Google XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".',
      howToContent: '1. Paste your existing resume bullet point.\n2. (Optional) Provide your role/title and target industry context.\n3. Click "Improve Resume Bullet".\n4. Review multiple high-impact variations categorized by style (Metric-focused, Leadership-oriented, Action-driven).',
      faqJson: [
        {
          question: 'Does the tool invent fake achievements?',
          answer: 'No. The tool uses placeholders like "[X%]" or "[number]" where specific numbers belong, encouraging you to insert your genuine historical performance data.'
        },
        {
          question: 'Is this compatible with Applicant Tracking Systems (ATS)?',
          answer: 'Yes! The phrasing is optimized with standard industry keywords and strong action verbs favored by ATS scanners.'
        }
      ],
      relatedTools: ['ai-email-writer', 'text-summarizer'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tool_ai_prompt_generator',
      categoryId: 'cat_prompts',
      name: 'AI Prompt Generator',
      slug: 'ai-prompt-generator',
      description: 'Craft high-performing, structured system prompts for ChatGPT, Claude, and Gemini with clear roles, constraints, and examples.',
      icon: 'Terminal',
      seoTitle: 'Free AI Prompt Generator – Craft Structured LLM Prompts | ClarifyAll',
      seoDescription: 'Build high-converting, robust prompts for ChatGPT, Claude, and Gemini. Define persona, task parameters, negative constraints, and output format.',
      introContent: 'Great AI outputs start with great prompts. The ClarifyAll Prompt Generator guides you through defining the exact persona, context, mission, chain-of-thought instructions, and negative guardrails to get consistent results from any LLM.',
      howToContent: '1. Select the task category (e.g. Coding, Copywriting, Analysis, Brainstorming).\n2. Describe what you want the AI to achieve.\n3. Set constraints (e.g. "No fluff, JSON format, cite sources").\n4. Click "Generate Prompt" and copy your battle-tested prompt template.',
      faqJson: [
        {
          question: 'Can I use these prompts in ChatGPT, Claude, and Gemini?',
          answer: 'Yes! The generated prompts adhere to universal prompt engineering best practices compatible with all leading foundation models.'
        }
      ],
      relatedTools: ['text-formatter', 'ai-email-writer'],
      status: 'PUBLISHED',
      isFeatured: true,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
  ];

  articles: Article[] = [
    {
      id: 'art_1',
      authorId: 'usr_editor_1',
      authorName: 'Editorial Staff',
      title: 'How to Compress Large PDF Files Without Losing Text Quality',
      slug: 'how-to-compress-pdf-without-losing-quality',
      excerpt: 'Learn the underlying mechanics of PDF compression, why certain files inflate to 50 MB, and how to optimize them cleanly for email.',
      body: `PDF documents frequently bloat in size due to uncompressed embedded raster graphics, redundant embedded font subsets, and uncompressed metadata streams. 

### Why PDF Files Get So Large

When you export a slide deck or scan a document, software often defaults to high print resolutions (300 to 600 DPI) and includes full character sets for fonts you may have only used once. 

1. **Embedded Images**: High-resolution photos are the #1 cause of ballooning file sizes.
2. **Duplicated Font Subsets**: Each chapter or merged page can accidentally bundle duplicate glyph caches.
3. **Ghost Metadata**: Revision histories and thumbnails linger inside the document binary.

### Best Practices for Clean Compression

- **Target 150 DPI for Digital Screens**: For emailing or web reading, 150 DPI offers identical visual clarity to human eyes while cutting image payload by 75%.
- **Flatten Unused Streams**: Remove outdated annotation layers and form calculation history.
- **Convert Color Palettes to sRGB**: Print CMYK files waste extra channels on digital screens.

Using ClarifyAll's PDF Compressor, this structural cleanup happens automatically in seconds without corrupting text vector outlines.`,
      seoTitle: 'How to Compress PDF Files Without Losing Quality | ClarifyAll Guide',
      seoDescription: 'Comprehensive guide to optimizing PDF file sizes for email and web uploads. Step-by-step techniques to reduce megabytes safely.',
      canonicalUrl: 'https://clarifyall.com/guides/how-to-compress-pdf-without-losing-quality',
      type: 'guide',
      status: 'PUBLISHED',
      publishedAt: '2026-01-12T10:00:00Z',
      createdAt: '2026-01-12T10:00:00Z',
      updatedAt: '2026-01-12T10:00:00Z',
    },
    {
      id: 'art_2',
      authorId: 'usr_editor_1',
      authorName: 'Career Coaching Team',
      title: 'Writing Resume Bullets That Actually Get Interviews: The XYZ Formula',
      slug: 'resume-bullets-xyz-formula-guide',
      excerpt: 'Stop listing job duties. Learn how top tech and business candidates frame their experience around quantifiable impact.',
      body: `Most candidates write resume bullets that describe their daily obligations rather than the value they created.

### The Problem With Duty-Based Bullets

Consider this typical statement:
> *"Responsible for managing customer support tickets and client onboarding."*

This fails to answer crucial recruiter questions:
- How many tickets?
- What was the customer satisfaction rating?
- Did onboarding speed improve?

### The Google XYZ Formula

Former Google SVP of People Operations Laszlo Bock popularized the most reliable format for high-performing resumes:

**"Accomplished [X], as measured by [Y], by doing [Z]"**

Let's transform the duty above using the XYZ formula:
> *"Reduced client onboarding time by 34% (Y) across 150+ enterprise accounts (X) by building automated email sequence templates and self-service video walkthroughs (Z)."*

Notice the immediate difference: it proves execution capability, demonstrates numerical literacy, and showcases initiative.

Use ClarifyAll's Resume Bullet Improver tool to automatically restructure your past accomplishments into this proven model.`,
      seoTitle: 'The XYZ Resume Bullet Formula Guide | ClarifyAll Career',
      seoDescription: 'Master the Google XYZ resume bullet formula. Transform boring job duties into compelling, quantifiable career achievements.',
      canonicalUrl: 'https://clarifyall.com/guides/resume-bullets-xyz-formula-guide',
      type: 'guide',
      status: 'PUBLISHED',
      publishedAt: '2026-01-15T14:30:00Z',
      createdAt: '2026-01-15T14:30:00Z',
      updatedAt: '2026-01-15T14:30:00Z',
    },
    {
      id: 'art_3',
      authorId: 'usr_editor_1',
      authorName: 'AI Research Staff',
      title: 'Prompt Engineering Fundamentals: Roles, Constraints, and Zero-Shot Blueprints',
      slug: 'prompt-engineering-fundamentals-blueprint',
      excerpt: 'A practical, hype-free guide to architecting reliable prompts for Claude, ChatGPT, and Gemini.',
      body: `Prompt engineering is not about finding "magic words" — it is about reducing ambiguity and clearly establishing output boundaries.

### The Core Anatomy of a Robust Prompt

A dependable prompt includes five distinct components:

1. **Persona & Context**: Establish the domain expertise, target audience, and perspective.
2. **Clear Objective**: State the exact task in unambiguous imperative sentences.
3. **Execution Steps**: Guide the model's internal thinking sequentially.
4. **Negative Constraints**: Explicitly forbid common failure modes (e.g., "Do not use corporate jargon", "Do not invent statistics").
5. **Output Specification**: Define the exact structure (JSON schema, Markdown table, or bullet count).

By structuring prompts methodically, you eliminate 90% of model hallucinations and ensure clean, reproducible responses every time.`,
      seoTitle: 'Prompt Engineering Fundamentals & Blueprints | ClarifyAll',
      seoDescription: 'Learn the architectural pillars of reliable prompt engineering. Step-by-step framework for system prompts, constraints, and schemas.',
      canonicalUrl: 'https://clarifyall.com/guides/prompt-engineering-fundamentals-blueprint',
      type: 'guide',
      status: 'PUBLISHED',
      publishedAt: '2026-01-18T09:00:00Z',
      createdAt: '2026-01-18T09:00:00Z',
      updatedAt: '2026-01-18T09:00:00Z',
    },
    {
      id: 'art_4',
      authorId: 'usr_editor_1',
      authorName: 'Editorial Staff',
      title: 'WebP vs JPEG vs PNG: Which Image Format Should You Use in 2026?',
      slug: 'webp-vs-jpeg-vs-png-image-format-comparison',
      excerpt: 'An in-depth technical comparison of file sizes, alpha transparency, browser compatibility, and compression efficiency.',
      body: `Selecting the right image format directly influences Core Web Vitals, Largest Contentful Paint (LCP), and user retention.

### Format Comparison Matrix

| Format | Transparency | Best For | Typical Compression Efficiency |
|---|---|---|---|
| **WebP** | Yes | Modern websites, photos, and UI graphics | 30% smaller than JPEG, 25% smaller than PNG |
| **JPEG** | No | Legacy photography, print proofs, backward compatibility | Good lossy compression |
| **PNG** | Yes | Pixel art, crisp line diagrams, uncompressed source files | Lossless fidelity |

### Verdict

For modern web production, **WebP** is the recommended default for 95% of use cases. It supports both lossy compression and alpha transparency. Use ClarifyAll's Image Converter to modernize your media assets.`,
      seoTitle: 'WebP vs JPEG vs PNG: Best Image Formats for Web | ClarifyAll',
      seoDescription: 'Compare WebP, JPEG, and PNG. Discover which format provides the fastest page load times and cleanest visual fidelity.',
      canonicalUrl: 'https://clarifyall.com/blog/webp-vs-jpeg-vs-png-image-format-comparison',
      type: 'blog',
      status: 'PUBLISHED',
      publishedAt: '2026-01-20T11:00:00Z',
      createdAt: '2026-01-20T11:00:00Z',
      updatedAt: '2026-01-20T11:00:00Z',
    },
  ];

  aiTools: AiToolDirectoryItem[] = [
    {
      id: 'aitool_chatgpt',
      name: 'ChatGPT',
      slug: 'chatgpt',
      vendorUrl: 'https://chatgpt.com',
      description: 'OpenAI\'s flagship conversational assistant offering multimodal analysis, code generation, and custom GPT workflows.',
      categories: ['AI Writing', 'Coding', 'General Productivity'],
      pricingModel: 'Freemium',
      features: ['Advanced conversational memory', 'Custom GPT creation', 'Voice mode', 'Canvas code & document editor'],
      limitations: ['Can occasionally hallucinate complex facts', 'Free tier rate limits during peak hours'],
      reviewContent: 'ChatGPT remains the benchmark general-purpose AI assistant. The interface is responsive and the GPT-4o series excels at drafting, brainstorming, and code refactoring.',
      lastVerifiedAt: '2026-01-20T00:00:00Z',
      status: 'PUBLISHED',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'aitool_claude',
      name: 'Claude 3.5 Sonnet',
      slug: 'claude-3-5-sonnet',
      vendorUrl: 'https://claude.ai',
      description: 'Anthropic\'s premier model renowned for nuanced writing, exceptional coding accuracy, and the Artifacts interactive canvas.',
      categories: ['AI Writing', 'Coding', 'Research'],
      pricingModel: 'Freemium',
      features: ['200K token context window', 'Artifacts interactive code sandbox', 'Subtle human-like writing tone', 'High coding benchmarks'],
      limitations: ['Strict message caps on the free tier', 'No native web browsing on basic accounts'],
      reviewContent: 'Claude 3.5 Sonnet is widely considered by developers and technical writers to produce the cleanest code and most authentic prose with minimal sycophancy.',
      lastVerifiedAt: '2026-01-20T00:00:00Z',
      status: 'PUBLISHED',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'aitool_perplexity',
      name: 'Perplexity AI',
      slug: 'perplexity-ai',
      vendorUrl: 'https://perplexity.ai',
      description: 'An AI-powered conversational search engine that synthesizes live web information with verifiable citations.',
      categories: ['Research', 'Search', 'General Productivity'],
      pricingModel: 'Freemium',
      features: ['Real-time web search integration', 'Footnoted source citations', 'Focus modes (Academic, YouTube, Reddit)', 'Collections'],
      limitations: ['Summaries are dependent on quality of indexed web pages', 'Pro search searches have daily allowances'],
      reviewContent: 'Perplexity has revolutionized information retrieval by replacing traditional search engine links with synthesis and reliable citations.',
      lastVerifiedAt: '2026-01-20T00:00:00Z',
      status: 'PUBLISHED',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'aitool_midjourney',
      name: 'Midjourney',
      slug: 'midjourney',
      vendorUrl: 'https://midjourney.com',
      description: 'State-of-the-art AI image generator producing photorealistic artwork, product concepts, and graphic illustrations.',
      categories: ['Image Utilities', 'Creative'],
      pricingModel: 'Paid',
      features: ['Industry-leading aesthetic lighting and textures', 'Web generation UI', 'Inpainting and outpainting', 'Vary region control'],
      limitations: ['Requires paid subscription ($10/mo minimum)', 'Steep learning curve for parameter syntax'],
      reviewContent: 'Midjourney continues to dominate commercial concept art and editorial imagery due to its unmatched lighting coherence and photographic realism.',
      lastVerifiedAt: '2026-01-20T00:00:00Z',
      status: 'PUBLISHED',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
  ];

  siteSettings: Record<string, string> = {
    site_title: 'ClarifyAll – AI Utilities & Productivity Platform',
    site_tagline: 'AI. Made Clear.',
    site_description: 'Free online AI utilities, PDF tools, image compressors, writing assistants, and productivity calculators.',
    contact_email: 'support@clarifyall.com',
    maintenance_mode: 'false',
    enable_ads: 'false',
    max_upload_size_mb: '25',
    ai_rate_limit_per_minute: '15',
  };

  adSlots: AdSlot[] = [
    {
      id: 'slot_header',
      slotKey: 'header_banner',
      placement: 'Below Top Navigation',
      enabled: false,
      configuration: { format: 'horizontal', client: 'ca-pub-demo' },
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'slot_sidebar',
      slotKey: 'article_sidebar',
      placement: 'Article Right Sidebar',
      enabled: false,
      configuration: { format: 'rectangle', client: 'ca-pub-demo' },
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'slot_tool_result',
      slotKey: 'tool_below_result',
      placement: 'Below Tool Processing Result',
      enabled: false,
      configuration: { format: 'responsive', client: 'ca-pub-demo' },
      updatedAt: '2026-01-10T00:00:00Z',
    },
  ];

  toolUsages: ToolUsageRecord[] = [
    {
      id: 'usg_1',
      toolId: 'tool_pdf_compressor',
      toolSlug: 'pdf-compressor',
      operation: 'compress',
      status: 'SUCCESS',
      processingDurationMs: 420,
      createdAt: '2026-02-01T08:12:00Z',
    },
    {
      id: 'usg_2',
      toolId: 'tool_word_counter',
      toolSlug: 'word-counter',
      operation: 'count',
      status: 'SUCCESS',
      processingDurationMs: 12,
      createdAt: '2026-02-01T08:15:00Z',
    },
    {
      id: 'usg_3',
      toolId: 'tool_ai_email_writer',
      toolSlug: 'ai-email-writer',
      operation: 'generate_email',
      status: 'SUCCESS',
      processingDurationMs: 890,
      createdAt: '2026-02-01T08:22:00Z',
    },
    {
      id: 'usg_4',
      toolId: 'tool_resume_bullet_improver',
      toolSlug: 'resume-bullet-improver',
      operation: 'improve_bullet',
      status: 'SUCCESS',
      processingDurationMs: 910,
      createdAt: '2026-02-01T08:35:00Z',
    },
  ];

  aiUsages: AiUsageRecord[] = [
    {
      id: 'ai_1',
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      operation: 'email_writer',
      inputTokens: 140,
      outputTokens: 210,
      estimatedCost: 0.000045,
      status: 'SUCCESS',
      createdAt: '2026-02-01T08:22:00Z',
    },
    {
      id: 'ai_2',
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      operation: 'resume_bullet',
      inputTokens: 180,
      outputTokens: 260,
      estimatedCost: 0.000055,
      status: 'SUCCESS',
      createdAt: '2026-02-01T08:35:00Z',
    },
  ];

  auditLogs: AuditLog[] = [
    {
      id: 'log_1',
      userId: 'usr_admin_1',
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'System',
      details: 'ClarifyAll core engine initialized with 14 tools and 6 categories.',
      ipAddress: '127.0.0.1',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  reviews: ToolReview[] = [
    {
      id: 'rev_1',
      toolSlug: 'pdf-compressor',
      userId: 'usr_demo_user',
      userName: 'Alex Creator',
      rating: 5,
      title: 'Reduced a 14MB client pitch deck down to 1.8MB instantly',
      comment: 'Super fast and retained crisp vector charts without any blurriness. I use this every week before sending email attachments to prospective clients.',
      pros: 'Instant browser processing, zero loss on text clarity, handles multi-page documents seamlessly',
      cons: 'None so far, works even on heavy graphic slides',
      verifiedUser: true,
      helpfulCount: 14,
      createdAt: '2026-02-10T14:22:00Z',
    },
    {
      id: 'rev_2',
      toolSlug: 'pdf-compressor',
      userId: null,
      userName: 'Elena Rostova',
      rating: 5,
      title: 'Reliable & privacy-first',
      comment: 'Appreciate that files are processed in-memory and not uploaded to mysterious third party ad trackers. Saved over 75% file weight on academic research papers.',
      pros: 'Clean UI, rapid response, privacy conscious',
      cons: 'Would love bulk folder drop in a future update',
      verifiedUser: false,
      helpfulCount: 8,
      createdAt: '2026-02-12T09:40:00Z',
    },
    {
      id: 'rev_3',
      toolSlug: 'pdf-compressor',
      userId: null,
      userName: 'Marcus Sterling',
      rating: 4,
      title: 'Very practical utility for daily ops',
      comment: 'Works great for contracts and scanned invoices. The compression ratio preview before downloading is very reassuring.',
      pros: 'Fast, shows exact percentage saved',
      cons: 'Slightly slower on 50MB+ scans',
      verifiedUser: false,
      helpfulCount: 5,
      createdAt: '2026-02-14T11:15:00Z',
    },
    {
      id: 'rev_4',
      toolSlug: 'ai-prompt-generator',
      userId: 'usr_demo_user',
      userName: 'Alex Creator',
      rating: 5,
      title: 'Constructs prompts that actually yield zero-shot success',
      comment: 'The multi-framework options (few-shot, chain of thought, role-task-context) save me 15 minutes of prompt engineering whenever setting up autonomous workflows.',
      pros: 'Structured format, negative constraints, customizable tone',
      cons: 'None',
      verifiedUser: true,
      helpfulCount: 19,
      createdAt: '2026-02-11T16:05:00Z',
    },
    {
      id: 'rev_5',
      toolSlug: 'ai-prompt-generator',
      userId: null,
      userName: 'Samantha Lee',
      rating: 5,
      title: 'Game changer for marketing copy and coding specs',
      comment: 'I fed it a brief 1-sentence idea and it output an elaborate XML-tagged system prompt ready for Gemini 1.5 Pro and Claude 3.5. Phenomenal accuracy.',
      pros: 'Zero fluff, copy button with clean markdown format',
      cons: 'None, fantastic',
      verifiedUser: false,
      helpfulCount: 11,
      createdAt: '2026-02-13T10:18:00Z',
    },
    {
      id: 'rev_6',
      toolSlug: 'ai-prompt-generator',
      userId: null,
      userName: 'Devon Patel',
      rating: 4,
      title: 'Well thought out prompting taxonomy',
      comment: 'Produces well-scoped prompt architectures with role, context, instructions, output format, and evaluation criteria.',
      pros: 'High quality output, clean formatting',
      cons: 'Can be verbose for simple tasks, but you can trim easily',
      verifiedUser: false,
      helpfulCount: 4,
      createdAt: '2026-02-15T08:30:00Z',
    },
    {
      id: 'rev_7',
      toolSlug: 'ai-email-writer',
      userId: 'usr_demo_user',
      userName: 'Alex Creator',
      rating: 5,
      title: 'Turned a stressful negotiation into a diplomatic masterpiece',
      comment: 'Used the executive tone setting to respond to an ambiguous vendor contract dispute. Received a positive agreement within 30 minutes. The tonal accuracy is unmatched.',
      pros: 'Multiple tone presets, quick subject line variations',
      cons: 'None',
      verifiedUser: true,
      helpfulCount: 16,
      createdAt: '2026-02-09T18:45:00Z',
    },
    {
      id: 'rev_8',
      toolSlug: 'ai-email-writer',
      userId: null,
      userName: 'Jordan Miller',
      rating: 4,
      title: 'Saves 30 minutes every morning',
      comment: 'Great for cold outreach, follow-ups, and polite declines. Doesn’t sound like robotic boilerplate.',
      pros: 'Natural phrasing, actionable calls to action',
      cons: 'Need to manually tweak specific names and dates',
      verifiedUser: false,
      helpfulCount: 6,
      createdAt: '2026-02-12T13:10:00Z',
    },
    {
      id: 'rev_9',
      toolSlug: 'resume-bullet-improver',
      userId: null,
      userName: 'Tariq Al-Mansoor',
      rating: 5,
      title: 'Landed 3 callbacks after rewriting my bullets with this',
      comment: 'Transformed passive duties like "responsible for backend services" into metric-driven wins like "Architected low-latency microservices reducing p99 latency by 42% across 1.2M queries".',
      pros: 'Quantified metrics, strong action verbs, XYZ formula',
      cons: 'None',
      verifiedUser: true,
      helpfulCount: 23,
      createdAt: '2026-02-08T12:00:00Z',
    },
    {
      id: 'rev_10',
      toolSlug: 'text-summarizer',
      userId: null,
      userName: 'Claire Dupont',
      rating: 5,
      title: 'Accurate executive summaries without hallucination',
      comment: 'Summarized a 20-page legal compliance memo into crisp key takeaways and action items in seconds. Bullet points captured every caveat accurately.',
      pros: 'Preserves critical details, customizable summary depth',
      cons: 'None',
      verifiedUser: false,
      helpfulCount: 9,
      createdAt: '2026-02-10T09:12:00Z',
    },
    {
      id: 'rev_11',
      toolSlug: 'word-counter',
      userId: null,
      userName: 'Chloe Bennett',
      rating: 5,
      title: 'Clean, distraction-free and accurate',
      comment: 'Gives reading time, speaking time, character density, and keyword frequency in real time. Perfect for blog formatting.',
      pros: 'Instant live updates, no lag, reading time metrics',
      cons: 'None',
      verifiedUser: false,
      helpfulCount: 7,
      createdAt: '2026-02-05T15:20:00Z',
    },
    {
      id: 'rev_12',
      toolSlug: 'image-to-text',
      userId: null,
      userName: 'Mateo Gomez',
      rating: 4,
      title: 'Very good OCR on printed receipts and book pages',
      comment: 'Parsed high-resolution photograph of an annotated textbook with zero spelling typos in the technical vocabulary.',
      pros: 'High recognition precision, format preservation',
      cons: 'Handwriting is harder to parse than crisp print',
      verifiedUser: false,
      helpfulCount: 12,
      createdAt: '2026-02-07T17:40:00Z',
    },
  ];

  subscribers: NewsletterSubscriber[] = [
    {
      id: 'sub_1',
      email: 'alex.chen@innovate.tech',
      name: 'Alex Chen',
      categories: ['ai-writing', 'coding', 'productivity'],
      frequency: 'weekly',
      status: 'active',
      source: 'home_hero',
      createdAt: '2026-01-15T09:30:00Z',
      updatedAt: '2026-01-15T09:30:00Z',
    },
    {
      id: 'sub_2',
      email: 'sarah.miller@designworks.io',
      name: 'Sarah Miller',
      categories: ['image-utilities', 'creative', 'prompts'],
      frequency: 'weekly',
      status: 'active',
      source: 'directory_footer',
      createdAt: '2026-01-22T14:15:00Z',
      updatedAt: '2026-01-22T14:15:00Z',
    },
    {
      id: 'sub_3',
      email: 'marcus.vance@venturelabs.co',
      name: 'Marcus Vance',
      categories: ['ai-writing', 'research', 'career-resume'],
      frequency: 'weekly',
      status: 'active',
      source: 'ai_tools_page',
      createdAt: '2026-02-01T11:00:00Z',
      updatedAt: '2026-02-01T11:00:00Z',
    },
  ];

  bookmarks: UserAiBookmark[] = [
    {
      id: 'bm_demo_1',
      userId: 'usr_demo_1',
      toolSlug: 'claude-3-5-sonnet',
      notes: 'Best for complex coding refactoring & prompt architecture',
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'bm_demo_2',
      userId: 'usr_demo_1',
      toolSlug: 'perplexity-ai',
      notes: 'Primary research engine for citation-backed market analysis',
      createdAt: '2026-02-05T14:30:00Z',
    },
    {
      id: 'bm_demo_3',
      userId: 'usr_demo_1',
      toolSlug: 'chatgpt',
      notes: 'General brainstorming and canvas document drafting',
      createdAt: '2026-02-08T09:15:00Z',
    },
  ];
}

export const dbStore = new DatabaseStore();
