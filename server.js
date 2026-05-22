import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env FIRST

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dbConnect from "./app/config/dbConnect.js";
import userRoutes from "./app/modules/user/routes.js";
import expenseRoutes from "./app/modules/expense/routes.js";
import http from "http";
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
