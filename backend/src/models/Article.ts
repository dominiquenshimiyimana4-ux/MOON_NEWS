import { Schema, model, Document } from 'mongoose';
import { ArticleStatus, CategorySlug } from '../config/types';

export interface IArticle extends Document {
  slug: string;
  title: { rw: string; en: string };
  subtitle?: { rw: string; en: string };
  excerpt: { rw: string; en: string };
  content: { rw: string; en: string };
  category: CategorySlug;
  authorId: Schema.Types.ObjectId;
  image: string;
  imageCaption?: string;
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number;
  views: number;
  shares: number;
  commentsCount: number;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  source?: string;
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
  };
}

const articleSchema = new Schema<IArticle>({
  slug: { type: String, required: true, unique: true },
  title: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  subtitle: {
    rw: String,
    en: String,
  },
  excerpt: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  content: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  category: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true },
  imageCaption: String,
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  readingTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  tags: [String],
  status: { type: String, enum: ['published', 'draft', 'scheduled', 'pending', 'rejected'], default: 'draft' },
  featured: { type: Boolean, default: false },
  breaking: { type: Boolean, default: false },
  source: String,
  seo: {
    title: String,
    description: String,
    canonical: String,
    ogImage: String,
  },
});

articleSchema.index({ slug: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });

export default model<IArticle>('Article', articleSchema);
