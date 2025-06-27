import mongoose, { Schema } from "mongoose";

const CollaboratorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
});

const PDFSchema = new Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [CollaboratorSchema],
    version: { type: Number, default: 1 },
    size: { type: Number, required: true },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    fileId: { type: String, required: true, unique: true },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastEditedAt: { type: Date },
    accessControl: {
      publicAccess: { type: Boolean, default: false },
      defaultRole: {
        type: String,
        enum: ["viewer", "editor"],
        default: "viewer",
      },
      roles: {
        editor: [{ type: Schema.Types.ObjectId, ref: "User" }],
        viewer: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("PDF", PDFSchema);
