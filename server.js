import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env FIRST

//Crone jobs
// import "./app/crones/planExpire.js";
// import "./app/crones/removeNotification.js";

// import { sendPushNotification } from "./app/utils/sendPush.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dbConnect from "./app/config/dbConnect.js";
import userRoutes from "./app/modules/user/routes.js";
// import verificationRoutes from "./app/modules/verification/routes.js";
import expenseRoute from "./app/modules/expense/routes.js";
// import transactionRoutes from "./app/modules/transaction/routes.js";
// import accountActivationRoutes from "./app/modules/activation/routes.js";
// import notificationsRoutes from "./app/modules/notifications/route.js";
// import { initSocket } from "./app/socket/socketIo.js";
import http from "http";
// ✅ Prepare mongoose for Mongoose 7+
mongoose.set("strictQuery", true);

// Initialize app
const app = express();

// ✅ Middlewares
app.use(cors()); // optional but recommended
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect Database
dbConnect();

// ✅ Routes
// app.use("/api/verify", verificationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/expense", expenseRoutes);
// app.use("/api/v1/", transactionRoutes);
// app.use("/api/v1/", accountActivationRoutes);
// app.use("/api/v1/", notificationsRoutes);

// // ✅ Initialize Socket.io
const server = http.createServer(app);
// initSocket(server);


// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// ✅ Optional: Global error handling for unhandled issues
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});


