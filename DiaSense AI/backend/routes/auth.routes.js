// diasense-ai-backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware"); // must attach req.user

// Auth
router.post("/register", authController.register);
router.post("/login", authController.login);

// Get current logged-in user (token required)
router.get("/me", authMiddleware, authController.me);

module.exports = router;