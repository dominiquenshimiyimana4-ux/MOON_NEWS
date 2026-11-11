import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'journalist' | 'reader' | 'advertiser';
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Always a bcrypt hash, never the plain password. `select: false` keeps the
  // hash out of every query result unless it is explicitly requested at login.
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  role: {
    type: String,
    enum: ['admin', 'editor', 'journalist', 'reader', 'advertiser'],
    default: 'reader',
  },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model<IUser>('User', userSchema);
