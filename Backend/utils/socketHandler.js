import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

/**
 * Socket.io event handler.
 *
 * Rooms:
 *   expense:<id>  – all sockets watching a specific expense (comments + presence)
 *   budget:<id>   – all sockets watching a shared budget (live balance updates)
 *
 * Events (client → server):
 *   join-expense   { expenseId }
 *   leave-expense  { expenseId }
 *   send-comment   { expenseId, text }
 *   typing         { expenseId, isTyping }
 *   join-budget    { budgetId }
 *   leave-budget   { budgetId }
 *
 * Events (server → client):
 *   new-comment    { comment }           – broadcast to expense room
 *   presence-update { expenseId, users } – broadcast to expense room
 *   typing-update  { expenseId, userId, username, isTyping }
 *   budget-update  { budget }            – broadcast to budget room
 *   error          { message }
 */

// expenseId → Set of { userId, username, socketId }
const presenceMap = new Map();

const addPresence = (expenseId, user, socketId) => {
  if (!presenceMap.has(expenseId)) presenceMap.set(expenseId, new Map());
  presenceMap.get(expenseId).set(socketId, { userId: user._id.toString(), username: user.username });
};

const removePresence = (expenseId, socketId) => {
  presenceMap.get(expenseId)?.delete(socketId);
  if (presenceMap.get(expenseId)?.size === 0) presenceMap.delete(expenseId);
};

const getPresenceList = (expenseId) => {
  const map = presenceMap.get(expenseId);
  if (!map) return [];
  return [...map.values()];
};

export const initSocketHandlers = (io) => {
  // ── Auth middleware: validate JWT from handshake auth ──────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select("-password -refreshToken");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`[Socket] ${user.username} connected (${socket.id})`);

    // ── Join expense room (presence + comments) ──────────────────────────────
    socket.on("join-expense", ({ expenseId }) => {
      if (!expenseId) return;
      socket.join(`expense:${expenseId}`);
      addPresence(expenseId, user, socket.id);

      const users = getPresenceList(expenseId);
      io.to(`expense:${expenseId}`).emit("presence-update", { expenseId, users });
    });

    // ── Leave expense room ───────────────────────────────────────────────────
    socket.on("leave-expense", ({ expenseId }) => {
      if (!expenseId) return;
      socket.leave(`expense:${expenseId}`);
      removePresence(expenseId, socket.id);

      const users = getPresenceList(expenseId);
      io.to(`expense:${expenseId}`).emit("presence-update", { expenseId, users });
    });

    // ── Send comment (saved to DB and broadcast) ─────────────────────────────
    socket.on("send-comment", async ({ expenseId, text }) => {
      if (!expenseId || !text?.trim()) {
        return socket.emit("error", { message: "expenseId and text are required" });
      }
      try {
        const comment = await Comment.create({
          expense: expenseId,
          author: user._id,
          text: text.trim(),
        });

        const populated = await comment.populate("author", "username name");
        io.to(`expense:${expenseId}`).emit("new-comment", { comment: populated });
      } catch (err) {
        console.error("[Socket] send-comment error:", err);
        socket.emit("error", { message: "Failed to save comment" });
      }
    });

    // ── Typing indicator ─────────────────────────────────────────────────────
    socket.on("typing", ({ expenseId, isTyping }) => {
      if (!expenseId) return;
      socket.to(`expense:${expenseId}`).emit("typing-update", {
        expenseId,
        userId: user._id.toString(),
        username: user.username,
        isTyping: !!isTyping,
      });
    });

    // ── Join budget room (live balance updates) ───────────────────────────────
    socket.on("join-budget", ({ budgetId }) => {
      if (!budgetId) return;
      socket.join(`budget:${budgetId}`);
    });

    socket.on("leave-budget", ({ budgetId }) => {
      if (!budgetId) return;
      socket.leave(`budget:${budgetId}`);
    });

    // ── Cleanup on disconnect ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] ${user.username} disconnected (${socket.id})`);
      // Remove from all expense presence rooms
      for (const [expenseId] of presenceMap) {
        const hadUser = presenceMap.get(expenseId)?.has(socket.id);
        removePresence(expenseId, socket.id);
        if (hadUser) {
          const users = getPresenceList(expenseId);
          io.to(`expense:${expenseId}`).emit("presence-update", { expenseId, users });
        }
      }
    });
  });
};

/**
 * Broadcast a budget update to all sockets in its room.
 * Called from the budget controller after every spend/refund.
 */
export const emitBudgetUpdate = (io, budget) => {
  io.to(`budget:${budget._id}`).emit("budget-update", { budget });
};
