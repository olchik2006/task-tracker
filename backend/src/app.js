import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.set("trust proxy", true);

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

app.use("/proxy/posthog", express.raw({ type: "*/*" }));

app.all("/proxy/posthog/*", async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace("/proxy/posthog", "");

    const forwardedFor =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    const realIp =
      req.headers["x-real-ip"] || req.socket.remoteAddress || req.ip;

    const response = await fetch(`https://us.i.posthog.com${targetPath}`, {
      method: req.method,
      headers: {
        "Content-Type":
          req.headers["content-type"] || "application/octet-stream",
        Host: "us.i.posthog.com",
        "X-Forwarded-For": Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor,
        "X-Real-IP": Array.isArray(realIp) ? realIp[0] : realIp,
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "content-encoding" &&
        key.toLowerCase() !== "transfer-encoding"
      ) {
        res.setHeader(key, value);
      }
    });

    res.send(buffer);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to proxy to PostHog" });
  }
});

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Task Tracker API is working",
  });
});

app.use("/api/tasks", taskRoutes);

export default app;
