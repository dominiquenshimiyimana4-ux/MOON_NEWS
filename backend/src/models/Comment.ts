import { Schema, model, Document } from 'mongoose';

export interface IComment extends Document {
  articleId: Schema.Types.ObjectId;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Date;
  likes: number;
  parentId?: Schema.Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
});

commentSchema.index({ articleId: 1 });

export default model<IComment>('Comment', commentSchema);
