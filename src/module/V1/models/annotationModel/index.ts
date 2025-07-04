import mongoose from "mongoose";

const AnnotationSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pdf",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    type: {
      type: String,
      enum: ["highlight", "comment", "drawing", "note"],
      default: "comment",
    },
    color: {
      type: String,
      default: "#000000",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AnnotationModel = mongoose.model("Annotation", AnnotationSchema);
export default AnnotationModel;
