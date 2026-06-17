import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env FIRST

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dbConnect from "./app/config/dbConnect.js";
import userRoutes from "./app/modules/user/routes.js";
import expenseRoutes from "./app/modules/expense/routes.js";
import groupRoutes from "./app/modules/group/routes.js";
import notificationRoutes from "./app/modules/notifications/route.js";
import http from "http";
import { sendPushNotification } from "./app/utils/sendPush.js";
mongoose.set("strictQuery", true);

// Initialize app
const app = express();

// ✅ Middlewares
app.use(cors()); // optional but recommended
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect();
app.use("/api/user", userRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/v1", notificationRoutes);
// // ✅ Initialize Socket.io
const server = http.createServer(app);
// initSocket(server);


// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

app.post("/", (req, res) => {
  console.log("API HIT");
  res.send("Working");
});
// ✅ Optional: Global error handling for unhandled issues
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});



app.post("/test-push", async (req, res) => {
  const { token, title, body } = req.body || {};
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "token is required",
    });
  }

  try {
    await sendPushNotification(token, title, body);

    return res.json({
      success: true,
      message: "Push notification sent",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to send push",
    });
  }
});
