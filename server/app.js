import cors from "cors";
import express from "express";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(clientOrigin) {
  const app = express();
  app.use(cors({ origin: clientOrigin, credentials: true }));
  app.use(express.json());
  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "queuecare-server" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/hospitals", hospitalRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/users", userRoutes);
  app.use(errorHandler);
  return app;
}
