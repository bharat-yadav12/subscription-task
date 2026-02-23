import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError";

import userRouter from "./routes/user.route";
import usageRouter from "./routes/usage.route";
import billingRouter from "./routes/billing.route";
import planRouter from "./routes/plan.route";
import subscriptionRouter from "./routes/subscription.route";
const app: Application = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/usage", usageRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use((err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
    errors: [],
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Subscription Billing API is running",
    version: "1.0.0",
    endpoints: {
      plans: "/api/v1/plans",
      users: "/api/v1/users",
      usage: "/api/v1/usage",
      billing: "/api/v1/billing",
    },
  });
});
export { app };
