import dotenv from "dotenv";
import http from "http";
dotenv.config();
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { environment } from "./config/environment.js";
import { createSocketServer } from "./socket/index.js";

const app = createApp(environment.clientOrigin);
const httpServer = http.createServer(app);
const io = createSocketServer(httpServer, environment.clientOrigin);
app.set("io", io);

connectDatabase()
  .then(() => httpServer.listen(environment.port, () => console.log(`QueueCare server running on port ${environment.port}`)))
  .catch((error) => { console.error("MongoDB connection error:", error); process.exit(1); });
