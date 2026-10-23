import { Schema, model, Document } from 'mongoose';
import { CategorySlug } from '../config/types';

export interface IVideo extends Document {
  slug: string;
  title: { rw: string; en: string };
  description: { rw: string; en: string };
  category: CategorySlug;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  publishedAt: Date;
  views: number;
}

const videoSchema = new Schema<IVideo>({
  slug: { type: String, required: true, unique: true },
  title: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  category: { type: String, required: true },
  thumbnail: { type: String, required: true },
  duration: { type: String, required: true },
  videoUrl: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

videoSchema.index({ category: 1, publishedAt: -1 });

export default model<IVideo>('Video', videoSchema);
