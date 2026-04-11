import connectDB from "../db/connectDB.js";
import { app } from "../app.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Startup error:", error);
    return res.status(500).json({
      success: false,
      message: "Server initialization failed",
    });
  }
}
