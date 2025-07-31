import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  parentComment?: Types.ObjectId;
  parentId?: Types.ObjectId;
  fileId?: Types.ObjectId;
  taggedUsers: Types.ObjectId[];
  deleted: boolean;
  commentId: string;
  position: any;
  pageNumber: number;
  replies: Types.ObjectId[];
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pageNumber: {
      type: Number,
    },
    position: {
      x: { type: Number },
      y: { type: Number },
    },
    fileId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "PDF",
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    taggedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    commentId: {
      type: String,
      required: true,
      unique: true,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const Comment = model<IComment>("Comment", CommentSchema);
