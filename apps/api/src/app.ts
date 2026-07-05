import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import { globalErrorHandler } from "@/middlewares/error";
import { authenticateJWT } from "@/middlewares/auth";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";

const app = express();

// Security Headers
app.use(helmet());

// GZIP Compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging Middleware
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use("/api/", apiLimiter);

// Mount Auth Routes
app.use("/api/auth", authRoutes);

// Mount User Routes
app.use("/api/users", userRoutes);


// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
