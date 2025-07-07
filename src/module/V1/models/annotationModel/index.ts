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
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    type: {
      type: String,
      enum: ["highlight", "comment", "drawing", "underline"],
      default: "comment",
    },
    color: {
      type: String,
      default: "#000000",
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
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
