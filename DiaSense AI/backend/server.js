require("dotenv").config(); // ✅ Load environment variables FIRST

const fs = require("fs");
const path = require("path");
const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/* Ensure uploads folder exists                                               */
/* -------------------------------------------------------------------------- */

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Uploads folder created");
}

/* -------------------------------------------------------------------------- */
/* Serve static uploads folder                                                */
/* IMPORTANT: Must be BEFORE routes                                           */
/* -------------------------------------------------------------------------- */

app.use("/uploads", require("express").static(uploadsDir));

/* -------------------------------------------------------------------------- */
/* Start Server                                                               */
/* -------------------------------------------------------------------------- */

async function startServer() {
  try {
    // ✅ Connect MongoDB first
    await connectDB();

    // ✅ Create HTTP server (better for scaling later)
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log("===============================================");
      console.log("✅ MongoDB connected successfully");
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📌 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🖼 Uploads URL: http://localhost:${PORT}/uploads`);
      console.log("===============================================");
    });

    // ✅ Handle server-level errors
    server.on("error", (err) => {
      console.error("❌ Server error:", err.message);
      process.exit(1);
    });

    // ✅ Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Server shutting down...");
      server.close(() => {
        console.log("💤 Server closed.");
        process.exit(0);
      });
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message || err);
    process.exit(1);
  }
}

startServer();