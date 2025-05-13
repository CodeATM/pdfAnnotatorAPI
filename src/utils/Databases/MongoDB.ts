import mongoose, { ConnectOptions } from "mongoose";
import logger from "../../logger";

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || "mongodb://localhost:27017/pdf-api";

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
