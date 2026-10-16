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
  relatedTools: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
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
  tools?: Tool[];
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

export interface AiToolItem {
  id: string;
  name: string;
  slug: string;
  vendorUrl: string;
  description: string;
  categories: string[];
  pricingModel: string;
  features: string[];
  limitations: string[];
  reviewContent: string;
  lastVerifiedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface AdSlotConfig {
  id: string;
  slotKey: string;
  placement: string;
  enabled: boolean;
  configuration?: Record<string, any>;
}

export interface AdminMetrics {
  totalTools: number;
  publishedTools: number;
  totalArticles: number;
  publishedArticles: number;
  totalAiTools: number;
  totalToolExecutions: number;
  successRate: number;
  totalAiRequests: number;
  estimatedAiCostUSD: number;
}

export interface ToolReview {
  id: string;
  toolSlug: string;
  userId?: string | null;
  userName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
  verifiedUser?: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ToolReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  categories: string[];
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'unsubscribed';
  source: string;
  createdAt: string;
}

export interface NewsletterSubscribePayload {
  email: string;
  name?: string;
  categories?: string[];
  frequency?: 'weekly' | 'biweekly' | 'monthly';
  source?: string;
}

export interface NewsletterStats {
  subscriberCount: number;
  frequency: string;
  nextEditionDate: string;
  curatedCategories: string[];
}

export interface AiToolBookmark {
  id: string;
  userId: string;
  toolSlug: string;
  notes?: string;
  createdAt: string;
  tool?: AiToolItem;
}
