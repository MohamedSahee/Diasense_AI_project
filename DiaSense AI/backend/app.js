// diasense-ai-backend/app.js (FULL REPLACE)
// ✅ STABLE VERSION (NO WILDCARD OPTIONS) + UPLOAD STATIC + CORS + SECURITY

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();

/* -------------------------------------------------------------------------- */
/*                               GLOBAL SETTINGS                              */
/* -------------------------------------------------------------------------- */

app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/*                               MIDDLEWARE                                   */
/* -------------------------------------------------------------------------- */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* -------------------------------------------------------------------------- */
/*                                   CORS                                     */
/* -------------------------------------------------------------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / curl / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.warn("⚠ CORS Blocked:", origin);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ IMPORTANT FIX:
// DO NOT use app.options("*") or app.options("/*") in your setup
// because your router/path-to-regexp crashes on wildcard patterns.
// Preflight will still work because cors() middleware is enabled.

/* -------------------------------------------------------------------------- */
/*                              STATIC FOLDERS                                */
/* -------------------------------------------------------------------------- */

const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

// Serve uploaded files:
// http://localhost:5000/uploads/doctors/<filename>
app.use("/uploads", express.static(uploadsRoot));

// Friendly helpers (optional)
app.get("/uploads", (_req, res) => {
  res.json({
    status: "success",
    message: "Uploads folder. Use /uploads/doctors/<filename>",
  });
});

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */

app.get("/", (_req, res) => {
  res.json({
    status: "success",
    message: "DiaSense AI Backend Running Successfully",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    status: "success",
    message: "API is working. Try /api/doctors , /api/auth , /api/predict",
  });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/doctors", require("./routes/doctor.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/predict", require("./routes/predict.routes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/chatbot", require("./routes/chatbot.routes"));
app.use("/api/wound", require("./routes/wound.routes"));

/* -------------------------------------------------------------------------- */
/*                              ERROR HANDLING                                */
/* -------------------------------------------------------------------------- */

app.use((err, _req, res, next) => {
  if (err?.message === "CORS not allowed") {
    return res.status(403).json({ message: "CORS blocked origin" });
  }
  next(err);
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("🔥 Global Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;