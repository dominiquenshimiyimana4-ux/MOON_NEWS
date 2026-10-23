import { Schema, model, Document } from 'mongoose';

export interface ILiveUpdate extends Document {
  eventId: Schema.Types.ObjectId;
  time: Date;
  title: { rw: string; en: string };
  body: { rw: string; en: string };
  media?: string;
  type: 'text' | 'photo' | 'video';
}

export interface ILiveEvent extends Document {
  slug: string;
  title: { rw: string; en: string };
  summary: { rw: string; en: string };
  cover: string;
  updates: ILiveUpdate[];
  createdAt: Date;
  isActive: boolean;
}

const liveUpdateSchema = new Schema<ILiveUpdate>({
  eventId: { type: Schema.Types.ObjectId, ref: 'LiveEvent', required: true },
  time: { type: Date, default: Date.now },
  title: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  body: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  media: String,
  type: { type: String, enum: ['text', 'photo', 'video'], default: 'text' },
});

const liveEventSchema = new Schema<ILiveEvent>({
  slug: { type: String, required: true, unique: true },
  title: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  summary: {
    rw: { type: String, required: true },
    en: { type: String, required: true },
  },
  cover: { type: String, required: true },
  updates: [liveUpdateSchema],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

liveEventSchema.index({ slug: 1 });
liveEventSchema.index({ isActive: 1 });

export const LiveUpdate = model<ILiveUpdate>('LiveUpdate', liveUpdateSchema);
export default model<ILiveEvent>('LiveEvent', liveEventSchema);
