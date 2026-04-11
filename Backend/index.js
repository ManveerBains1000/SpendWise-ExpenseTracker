import connectDB from "./db/connectDB.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { app, socketCorsOrigin } from "./app.js";
import { startRecurringJob } from "./utils/recurringJob.js";
import { initSocketHandlers } from "./utils/socketHandler.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: socketCorsOrigin,
    credentials: true,
  },
});

app.set("io", io);
connectDB()
  .then(() => {
    initSocketHandlers(io);
    startRecurringJob();

    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });
