import { Schema, model, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: 'Basic' | 'Premium' | 'Pro';
  priceMonthly: number;
  subscribers: number;
  churnRate: number;
  features: string[];
  createdAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { type: String, enum: ['Basic', 'Premium', 'Pro'], required: true, unique: true },
  priceMonthly: { type: Number, required: true },
  subscribers: { type: Number, default: 0 },
  churnRate: { type: Number, default: 0 },
  features: [String],
  createdAt: { type: Date, default: Date.now },
});

export default model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
