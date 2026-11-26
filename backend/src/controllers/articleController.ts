import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Article from '../models/Article';
import { CategorySlug, ArticleStatus } from '../config/types';

export interface ArticleQuery {
  category?: CategorySlug;
  status?: ArticleStatus;
  featured?: boolean;
  breaking?: boolean;
  authorId?: string;
  tag?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'relevance';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const buildQuery = (q: ArticleQuery) => {
  const query: any = {};

  // By default, only show published articles unless status is specified
  query.status = q.status || 'published';

  if (q.category) query.category = q.category;
  if (q.featured !== undefined) query.featured = q.featured;
  if (q.breaking !== undefined) query.breaking = q.breaking;
  if (q.authorId) query.authorId = q.authorId;

  if (q.tag) query.tags = q.tag;

  if (q.search) {
    query.$or = [
      { 'title.en': { $regex: q.search, $options: 'i' } },
      { 'title.rw': { $regex: q.search, $options: 'i' } },
      { 'excerpt.en': { $regex: q.search, $options: 'i' } },
      { 'excerpt.rw': { $regex: q.search, $options: 'i' } },
      { tags: { $in: [new RegExp(q.search, 'i')] } },
    ];
  }

  return query;
};

const sortArticles = (sort?: string): any => {
  switch (sort) {
    case 'oldest':
      return { publishedAt: 1 };
    case 'popular':
      return { views: -1 };
    case 'relevance':
      return { views: -1 }; // Simplified relevance scoring
    case 'newest':
    default:
      return { publishedAt: -1 };
  }
};

export const articleController = {
  list: async (req: AuthRequest, res: Response) => {
    try {
      const requestedPage = Number.parseInt(req.query.page as string, 10);
      const requestedPageSize = Number.parseInt(req.query.pageSize as string, 10);
      if (
        (req.query.page !== undefined && (!Number.isInteger(requestedPage) || requestedPage < 1)) ||
        (req.query.pageSize !== undefined && (!Number.isInteger(requestedPageSize) || requestedPageSize < 1 || requestedPageSize > 100))
      ) {
        return res.status(400).json({ error: 'Page must be positive and pageSize must be between 1 and 100.' });
      }
      const page = requestedPage || 1;
      const pageSize = requestedPageSize || 9;
      const category = req.query.category as CategorySlug | undefined;
      const requestedStatus = req.query.status as ArticleStatus | undefined;
      const canViewDrafts = Boolean(
        req.user && ['admin', 'editor', 'journalist'].includes(req.user.role),
      );
      const status = canViewDrafts ? requestedStatus : 'published';
      if (
        requestedStatus &&
        !['published', 'draft', 'scheduled', 'pending', 'rejected'].includes(requestedStatus)
      ) {
        return res.status(400).json({ error: 'Invalid article status.' });
      }
      const featured = req.query.featured === 'true';
      const breaking = req.query.breaking === 'true';
      const authorId = req.query.authorId as string | undefined;
      const tag = req.query.tag as string | undefined;
      const search = req.query.search as string | undefined;
      const sort = (req.query.sort as string) || 'newest';
      if (!['newest', 'oldest', 'popular', 'relevance'].includes(sort)) {
        return res.status(400).json({ error: 'Invalid article sort order.' });
      }

      const query: ArticleQuery = {
        category,
        status,
        featured: featured || undefined,
        breaking: breaking || undefined,
        authorId,
        tag,
        search,
        sort: sort as 'newest' | 'oldest' | 'popular' | 'relevance',
      };

      const mongoQuery = buildQuery(query);
      const sortQuery = sortArticles(sort);

      const total = await Article.countDocuments(mongoQuery);
      const skip = (page - 1) * pageSize;

      const articles = await Article.find(mongoQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(pageSize)
        .populate('authorId', 'name email avatar');

      const response: PaginatedResponse<any> = {
        items: articles.map(a => ({
          ...a.toObject(),
          id: a._id.toString(),
          authorId: (a.authorId as any)?.id || (a.authorId as any)?._id.toString(),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };

      res.json(response);
    } catch (error) {
      console.error('List articles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getBySlug: async (req: AuthRequest, res: Response) => {
    try {
      const { slug } = req.params;

      const articleQuery: Record<string, unknown> = { slug };
      if (!req.user || !['admin', 'editor', 'journalist'].includes(req.user.role)) {
        articleQuery.status = 'published';
      }
      const article = await Article.findOne(articleQuery).populate('authorId', 'name email avatar position bio');
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Increment view count
      article.views += 1;
      await article.save();

      res.json({
        ...article.toObject(),
        id: article._id.toString(),
        authorId: (article.authorId as any)?.id || (article.authorId as any)?._id.toString(),
      });
    } catch (error) {
      console.error('Get article by slug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !['admin', 'editor', 'journalist'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden - Only staff can create articles' });
      }

      const { title, excerpt, content, category, image, tags, status, featured, breaking } = req.body;

      if (!title || !excerpt || !content || !category || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (
        typeof title !== 'object' || typeof title.en !== 'string' || typeof title.rw !== 'string' ||
        typeof excerpt !== 'object' || typeof excerpt.en !== 'string' || typeof excerpt.rw !== 'string' ||
        typeof content !== 'object' || typeof content.en !== 'string' || typeof content.rw !== 'string' ||
        typeof category !== 'string' || typeof image !== 'string' ||
        (tags !== undefined && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === 'string'))) ||
        (status !== undefined && (typeof status !== 'string' || !['published', 'draft', 'scheduled', 'pending', 'rejected'].includes(status))) ||
        (featured !== undefined && typeof featured !== 'boolean') ||
        (breaking !== undefined && typeof breaking !== 'boolean')
      ) {
        return res.status(400).json({ error: 'Invalid article fields.' });
      }

      // Generate a URL-safe unique slug from the English title.
      const slug = title.en.trim().toLowerCase().normalize('NFKD')
        .replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      if (!slug) return res.status(400).json({ error: 'Article title must contain letters or numbers.' });
      if (await Article.exists({ slug })) {
        return res.status(409).json({ error: 'An article with this title already exists.' });
      }

      const article = new Article({
        slug,
        title,
        excerpt,
        content,
        category,
        image,
        tags: tags || [],
        status: status || 'draft',
        featured: featured || false,
        breaking: breaking || false,
        authorId: req.user.id,
        readingTime: Math.ceil((content.en || content).split(/\s+/).length / 200),
      });

      await article.save();
      await article.populate('authorId', 'name email avatar');

      res.status(201).json({
        ...article.toObject(),
        id: article._id.toString(),
        authorId: (article.authorId as any)?.id || (article.authorId as any)?._id.toString(),
      });
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !['admin', 'editor', 'journalist'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden - Only staff can update articles' });
      }

      const { id } = req.params;
      const article = await Article.findById(id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (article.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Cannot update other authors articles' });
      }

      const updates = req.body as Record<string, unknown>;
      const allowedFields = ['title', 'subtitle', 'excerpt', 'content', 'category', 'image', 'imageCaption', 'publishedAt', 'readingTime', 'tags', 'status', 'featured', 'breaking', 'source', 'seo'] as const;
      const invalidField = Object.keys(updates).find((key) => !allowedFields.includes(key as (typeof allowedFields)[number]));
      if (invalidField) {
        return res.status(400).json({ error: `Field '${invalidField}' cannot be updated.` });
      }
      if (updates.title !== undefined) {
        const title = updates.title as { en?: unknown; rw?: unknown };
        if (!title || typeof title.en !== 'string' || typeof title.rw !== 'string') {
          return res.status(400).json({ error: 'Article titles must include English and Kinyarwanda text.' });
        }
        const slug = title.en.trim().toLowerCase().normalize('NFKD')
          .replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        if (!slug) return res.status(400).json({ error: 'Article title must contain letters or numbers.' });
        if (slug !== article.slug && await Article.exists({ slug })) {
          return res.status(409).json({ error: 'An article with this title already exists.' });
        }
        article.slug = slug;
      }
      if (updates.status !== undefined && !['published', 'draft', 'scheduled', 'pending', 'rejected'].includes(String(updates.status))) {
        return res.status(400).json({ error: 'Invalid article status.' });
      }
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
          (article as unknown as Record<string, unknown>)[field] = updates[field];
        }
      }

      article.updatedAt = new Date();
      await article.save();
      await article.populate('authorId', 'name email avatar');

      res.json({
        ...article.toObject(),
        id: article._id.toString(),
        authorId: (article.authorId as any)?.id || (article.authorId as any)?._id.toString(),
      });
    } catch (error) {
      console.error('Update article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Only admins can delete articles' });
      }

      const { id } = req.params;
      const article = await Article.findByIdAndDelete(id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
