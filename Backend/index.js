import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({ path: "./.env" });

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,               // allow cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import expenseRouter from "./routes/Expense.routes.js";
import { startRecurringJob } from './utils/recurringJob.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/expense", expenseRouter);

connectDB()
  .then(() => {
    // start scheduled jobs
    startRecurringJob();
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });
