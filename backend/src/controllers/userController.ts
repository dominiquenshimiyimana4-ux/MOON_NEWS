import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Bookmark from '../models/Bookmark';
import NewsletterSubscriber from '../models/NewsletterSubscriber';
import Article from '../models/Article';
import { Types } from 'mongoose';

export const userController = {
  // Bookmarks
  getBookmarks: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const bookmarks = await Bookmark.find({ userId: req.user.id })
        .populate('articleId');

      res.json(bookmarks.map(b => ({
        ...b.toObject(),
        id: b._id.toString(),
        userId: b.userId.toString(),
        articleId: (b.articleId as any)?.id || (b.articleId as any)?._id.toString(),
      })));
    } catch (error) {
      console.error('Get bookmarks error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  addBookmark: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const { articleId } = req.body;

      if (!articleId || !Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({ error: 'Valid articleId is required' });
      }

      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const existingBookmark = await Bookmark.findOne({
        userId: req.user.id,
        articleId,
      });

      if (existingBookmark) {
        return res.status(409).json({ error: 'Article already bookmarked' });
      }

      const bookmark = new Bookmark({
        userId: req.user.id,
        articleId,
      });

      await bookmark.save();
      await bookmark.populate('articleId');

      res.status(201).json({
        ...bookmark.toObject(),
        id: bookmark._id.toString(),
        userId: bookmark.userId.toString(),
        articleId: (bookmark.articleId as any)?.id || (bookmark.articleId as any)?._id.toString(),
      });
    } catch (error) {
      console.error('Add bookmark error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  removeBookmark: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const { articleId } = req.params;

      if (!articleId || !Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({ error: 'Valid articleId is required' });
      }

      const bookmark = await Bookmark.findOneAndDelete({
        userId: req.user.id,
        articleId,
      });

      if (!bookmark) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }

      res.json({ message: 'Bookmark removed' });
    } catch (error) {
      console.error('Remove bookmark error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Newsletter
  subscribeNewsletter: async (req: AuthRequest, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const existingSubscriber = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
      if (existingSubscriber) {
        return res.status(409).json({ error: 'Email already subscribed' });
      }

      const subscriber = new NewsletterSubscriber({
        email: email.toLowerCase(),
      });

      await subscriber.save();

      res.status(201).json({
        id: subscriber._id.toString(),
        email: subscriber.email,
        createdAt: subscriber.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Subscribe newsletter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  unsubscribeNewsletter: async (req: AuthRequest, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const subscriber = await NewsletterSubscriber.findOneAndDelete({ email: email.toLowerCase() });

      if (!subscriber) {
        return res.status(404).json({ error: 'Subscriber not found' });
      }

      res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
      console.error('Unsubscribe newsletter error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // User profile
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      // This would be expanded to get full user data from User model
      res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized - Must be logged in' });
      }

      const { name, avatar, bio } = req.body;
      // This would update the user in the User model
      // For now, just return success

      res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name,
        avatar,
        bio,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
