import dotenv from "dotenv";
dotenv.config();
import { Request,Response } from "express";
import connectDB from "./config/db";
import { app } from "./app";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  })
  .catch((err: Error) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

