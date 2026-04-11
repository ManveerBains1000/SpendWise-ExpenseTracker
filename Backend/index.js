import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = createServer(app);

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Make `io` accessible from controllers via req.app.get("io")
app.set("io", io);

// ── Express middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
import userRouter from "./routes/user.routes.js";
import expenseRouter from "./routes/Expense.routes.js";
import commentRouter from "./routes/comment.routes.js";
import budgetRouter from "./routes/budget.routes.js";
import delegationRouter from "./routes/delegation.routes.js";
import { startRecurringJob } from "./utils/recurringJob.js";
import { initSocketHandlers } from "./utils/socketHandler.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/expense", expenseRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/delegations", delegationRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    // Register all Socket.io event handlers
    initSocketHandlers(io);

    // Start cron jobs
    startRecurringJob();

    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });
