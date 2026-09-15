import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Configuration
import "./config/firebase.js";

// Middleware
import { notFound } from "./middleware/notFoundMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { protect } from "./middleware/authMiddleware.js";
import { upload } from "./middleware/uploadMiddleware.js";

// Services & Utilities
import { uploadFile } from "./services/storageService.js";
import { successResponse, errorResponse } from "./utils/apiResponse.js";

// Route modules
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// CORS configuration for trusted frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ];

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: Access denied for this origin."));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve local upload assets if fallback storage is used
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  return successResponse(res, 200, "CRM API is running");
});

// File upload endpoint (Profile images, attachments, customer docs)
app.post("/api/upload", protect, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No file provided for upload.");
    }
    const folder = req.body.folder || req.query.folder || "general";
    const uploadResult = await uploadFile(req.file, folder);

    return successResponse(res, 201, "File uploaded successfully", uploadResult);
  } catch (error) {
    next(error);
  }
});

// API domain routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// Fallback: 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`🚀 CRM Backend Server running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use by another process. Please close it first.`);
    } else {
      console.error(`❌ Server error:`, error.message);
    }
  });
}

export default app;
