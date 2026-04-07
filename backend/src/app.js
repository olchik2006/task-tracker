import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://task-tracker-rjpg.onrender.com"],
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
