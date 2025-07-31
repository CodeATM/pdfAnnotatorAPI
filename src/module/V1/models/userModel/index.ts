import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

type UsageType = "Personal" | "Work" | "Academics" | "Other";
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  usage: UsageType[];
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  verificationCode: string;
  verificationCodeExpiresAt: Date;
  isEmailVerified: boolean;
  favoriteFiles: mongoose.Types.ObjectId[];
  username: string;
  avatar?: string;
}

// Define the User Schema
const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    usage: {
      type: [String],
      enum: ["Personal", "Work", "Academics", "Other"],
      default: ["Personal"],
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    password: {
      type: String,
      // minlength: [6, "Password must be at least 6 characters long"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationCodeExpiresAt: {
      type: Date,
      required: false,
    },
    favoriteFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PDF",
      },
    ],
    username: { type: String, required: true, unique: true, lowercase: true },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export the Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
