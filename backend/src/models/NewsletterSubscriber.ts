import { Schema, model, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  createdAt: Date;
  verified: boolean;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

newsletterSubscriberSchema.index({ email: 1 });

export default model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
