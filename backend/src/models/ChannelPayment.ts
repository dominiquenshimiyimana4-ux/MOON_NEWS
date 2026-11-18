import { Schema, model, Document } from 'mongoose';

export type BillingPeriod = 'monthly' | 'yearly';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface IChannelPayment extends Document {
  channelId: string;
  ownerId: string;
  planId: string;
  planName: string;
  billingPeriod: BillingPeriod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** Provider reference from the secure payment provider — never card data. */
  provider: string;
  providerRef: string;
  checkoutUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const channelPaymentSchema = new Schema<IChannelPayment>(
  {
    channelId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    billingPeriod: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'RWF' },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending', index: true },
    provider: { type: String, default: 'flutterwave' },
    providerRef: { type: String, required: true },
    checkoutUrl: { type: String },
  },
  { timestamps: true }
);

export default model<IChannelPayment>('ChannelPayment', channelPaymentSchema);
