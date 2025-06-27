import mongoose, { Schema } from "mongoose";

const accessRequestSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
      ref: "PDF",
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const AccessRequest = mongoose.model(
  "AccessRequest",
  accessRequestSchema
);
