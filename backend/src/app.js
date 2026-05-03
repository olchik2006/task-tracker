import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-tracker-rjpg.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Task Tracker API is working",
  });
});

app.use("/api/tasks", taskRoutes);

export default app;
