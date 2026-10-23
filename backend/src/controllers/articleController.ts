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
  let query: any = {};

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
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 9;
      const category = req.query.category as CategorySlug | undefined;
      const status = req.query.status as ArticleStatus | undefined;
      const featured = req.query.featured === 'true';
      const breaking = req.query.breaking === 'true';
      const authorId = req.query.authorId as string | undefined;
      const tag = req.query.tag as string | undefined;
      const search = req.query.search as string | undefined;
      const sort = (req.query.sort as string) || 'newest';

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

      const article = await Article.findOne({ slug }).populate('authorId', 'name email avatar position bio');
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

      // Generate slug from title
      const slug = (title.en || title).toLowerCase().replace(/\s+/g, '-');

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

      const updates = req.body;
      Object.keys(updates).forEach(key => {
        if (key !== '_id' && key !== 'authorId' && key !== 'createdAt') {
          (article as any)[key] = updates[key];
        }
      });

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
