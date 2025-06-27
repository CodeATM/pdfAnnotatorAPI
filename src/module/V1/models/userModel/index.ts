import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

// Define the User Interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  role: "Personal" | "Business" | "Academics";
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    role: {
      type: String,
      enum: ["Personal", "Business", "Academics"],
      default: "Personal",
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
      minlength: [6, "Password must be at least 6 characters long"],
    },
  },
  {
    timestamps: true, 
  }
);  

// Export the Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
