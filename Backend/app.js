import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRouter from "./routes/user.routes.js";
import expenseRouter from "./routes/Expense.routes.js";
import commentRouter from "./routes/comment.routes.js";
import budgetRouter from "./routes/budget.routes.js";
import delegationRouter from "./routes/delegation.routes.js";

dotenv.config({ path: "./.env" });

const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllOrigins = configuredOrigins.includes("*");

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowAllOrigins) return true;
  return configuredOrigins.includes(origin);
};

export const socketCorsOrigin = allowAllOrigins ? "*" : configuredOrigins;

const app = express();
app.set("io", null);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/expense", expenseRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/delegations", delegationRouter);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

export { app };
