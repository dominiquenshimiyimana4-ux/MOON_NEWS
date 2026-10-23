import { Schema, model, Document } from 'mongoose';
import { CategorySlug } from '../config/types';

export interface IPhotoGallery extends Document {
  slug: string;
  title: { rw: string; en: string };
  cover: string;
  category: CategorySlug;
  publishedAt: Date;
  photos: Array<{ url: string; caption: { rw: string; en: string } }>;
}

const photoGallerySchema = new Schema<IPhotoGallery>({
  slug: { type: String, required: true, unique: true },
  title: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  cover: { type: String, required: true },
  category: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  photos: [
    {
      url: { type: String, required: true },
      caption: {
        rw: { type: String, required: true },
        en: { type: String, required: true },
      },
    },
  ],
});

photoGallerySchema.index({ category: 1, publishedAt: -1 });

export default model<IPhotoGallery>('PhotoGallery', photoGallerySchema);
