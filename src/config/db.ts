import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";
const connectDB = async (): Promise<void> => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log(
      `MongoDB Connected Successfully — Host: ${connectionInstance.connection.host}`
    );

  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Failed: ${error.message}`);
    } else {
      console.error("MongoDB Connection Failed: Unknown error");
    }
    process.exit(1);
  }
};

export default connectDB;