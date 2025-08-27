import { Schema, model, Document, Types } from "mongoose";

export type ActivityType =
  | "comment_added"
  | "comment_tagged"
  | "highlight_added"
  | "underline_added"
  | "file_renamed"
  | "user_joined";

export type ActivityVisibility = "system" | "user" | "private";

export interface IActivity extends Document {
  actor: Types.ObjectId;
  fileId: String;
  annotationId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  type: ActivityType;
  visibility: ActivityVisibility;
  targetUser?: Types.ObjectId;
  others?: Record<string, any>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileId: {
      type: String,
      required: true,
    },
    annotationId: { type: Schema.Types.ObjectId, ref: "Annotation" },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    type: { type: String, required: true },
    visibility: { type: String, default: "user" },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    others: { type: Object },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = model<IActivity>("Activity", activitySchema);
