import { Schema, model, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  advertiser: string;
  placement: 'homepage' | 'article' | 'sidebar' | 'newsletter' | 'category';
  type: 'banner' | 'video' | 'native';
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'paused' | 'ended' | 'pending' | 'draft' | 'scheduled';
  content?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    callToAction?: string;
    targetUrl?: string;
  };
}

const advertisementSchema = new Schema<IAdvertisement>({
  advertiser: { type: String, required: true },
  placement: { type: String, enum: ['homepage', 'article', 'sidebar', 'newsletter', 'category'], required: true },
  type: { type: String, enum: ['banner', 'video', 'native'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'ended', 'pending', 'draft', 'scheduled'], default: 'draft' },
  content: {
    title: String,
    description: String,
    imageUrl: String,
    videoUrl: String,
    callToAction: String,
    targetUrl: String,
  },
});

advertisementSchema.index({ status: 1, startDate: 1 });

export default model<IAdvertisement>('Advertisement', advertisementSchema);
