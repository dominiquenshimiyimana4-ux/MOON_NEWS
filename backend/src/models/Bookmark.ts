import { Schema, model, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: Schema.Types.ObjectId;
  articleId: Schema.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  createdAt: { type: Date, default: Date.now },
});

bookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export default model<IBookmark>('Bookmark', bookmarkSchema);
