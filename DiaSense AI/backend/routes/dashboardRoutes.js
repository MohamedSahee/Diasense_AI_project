const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Common dashboard
router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "Dashboard access granted",
    userId: req.user.id,
    role: req.user.role,
  });
});

// Admin only
router.get("/admin", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  res.json({ message: "Welcome Admin Dashboard" });
});

// Doctor only
router.get("/doctor", authMiddleware, (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Doctor access only" });
  }
  res.json({ message: "Welcome Doctor Dashboard" });
});

module.exports = router;