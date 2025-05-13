import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  otp?: string;
  otpExpiresAt?: Date;
}

// Define the Session schema
const sessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    accessTokenExpiresAt: {
      type: Date,
    },
    refreshTokenExpiresAt: {
      type: Date,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true, 
  }
);

// Export the Session model
const Session: Model<ISession> = mongoose.model<ISession>(
  "Session",
  sessionSchema
);

export default Session;
