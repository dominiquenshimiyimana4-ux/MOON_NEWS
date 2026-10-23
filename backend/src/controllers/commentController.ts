import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Comment from '../models/Comment';
import Article from '../models/Article';
import { Types } from 'mongoose';

export const commentController = {
  listForArticle: async (req: AuthRequest, res: Response) => {
    try {
      const { articleId } = req.query;

      if (!articleId) {
        return res.status(400).json({ error: 'articleId is required' });
      }

      if (!Types.ObjectId.isValid(articleId as string)) {
        return res.status(400).json({ error: 'Invalid articleId' });
      }

      const comments = await Comment.find({ articleId })
        .sort({ createdAt: -1 });

      res.json(comments.map(c => ({
        ...c.toObject(),
        id: c._id.toString(),
        articleId: c.articleId.toString(),
        parentId: c.parentId?.toString() || null,
      })));
    } catch (error) {
      console.error('List comments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const { articleId, content, parentId } = req.body;

      if (!articleId || !content) {
        return res.status(400).json({ error: 'articleId and content are required' });
      }

      if (!Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({ error: 'Invalid articleId' });
      }

      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const comment = new Comment({
        articleId,
        authorName: req.user.email.split('@')[0], // Using email prefix as name
        authorAvatar: '', // Default avatar, can be enhanced
        content,
        parentId: parentId || null,
      });

      await comment.save();

      // Update article comment count
      article.commentsCount = (article.commentsCount || 0) + 1;
      await article.save();

      res.status(201).json({
        ...comment.toObject(),
        id: comment._id.toString(),
        articleId: comment.articleId.toString(),
        parentId: comment.parentId?.toString() || null,
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Only allow editing own comments or admin
      if (comment.authorName !== req.user.email.split('@')[0] && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Cannot edit other comments' });
      }

      comment.content = content;
      await comment.save();

      res.json({
        ...comment.toObject(),
        id: comment._id.toString(),
        articleId: comment.articleId.toString(),
        parentId: comment.parentId?.toString() || null,
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const { id } = req.params;
      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Only allow deleting own comments or admin
      if (comment.authorName !== req.user.email.split('@')[0] && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Cannot delete other comments' });
      }

      await Comment.findByIdAndDelete(id);

      // Update article comment count
      const article = await Article.findById(comment.articleId);
      if (article) {
        article.commentsCount = Math.max(0, (article.commentsCount || 0) - 1);
        await article.save();
      }

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  likeComment: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      comment.likes += 1;
      await comment.save();

      res.json({
        ...comment.toObject(),
        id: comment._id.toString(),
        articleId: comment.articleId.toString(),
        parentId: comment.parentId?.toString() || null,
      });
    } catch (error) {
      console.error('Like comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
