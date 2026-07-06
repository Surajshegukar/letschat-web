import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "@/config/env";
import { globalErrorHandler } from "@/middlewares/error";
import { registerRoutes } from "@/routes/routes.config";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "error",
      statusCode: 429,
      message: "Too many requests from this IP, please try again after 15 minutes",
    },
  })
);

registerRoutes(app);

app.use(globalErrorHandler);

export default app;
