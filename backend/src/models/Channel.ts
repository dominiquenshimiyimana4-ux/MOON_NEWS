import { Schema, model, Document } from 'mongoose';

export type ChannelType = 'radio' | 'television';
export type ChannelStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'canceled';

export interface IChannel extends Document {
  ownerId: string; // User._id of the station account
  stationName: string;
  logo?: string;
  type: ChannelType;
  description: string;
  location: string;
  streamUrl: string; // streaming or website link
  status: ChannelStatus;
  reviewNote?: string; // admin note on rejection
  reviewedBy?: string;
  reviewedAt?: Date;
  subscription: {
    status: SubscriptionStatus;
    plan: string | null; // plan id
    planName: string | null;
    billingPeriod: 'monthly' | 'yearly' | null;
    startedAt?: Date;
    renewsAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    ownerId: { type: String, required: true, index: true },
    stationName: { type: String, required: true, trim: true },
    logo: { type: String },
    type: { type: String, enum: ['radio', 'television'], required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    location: { type: String, required: true, trim: true },
    streamUrl: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewNote: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    subscription: {
      status: { type: String, enum: ['none', 'active', 'past_due', 'canceled'], default: 'none' },
      plan: { type: String, default: null },
      planName: { type: String, default: null },
      billingPeriod: { type: String, enum: ['monthly', 'yearly', null], default: null },
      startedAt: { type: Date },
      renewsAt: { type: Date },
    },
  },
  { timestamps: true }
);

// One channel per station account.
channelSchema.index({ ownerId: 1 }, { unique: true });

export default model<IChannel>('Channel', channelSchema);
