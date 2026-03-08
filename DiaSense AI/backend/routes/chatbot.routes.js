const express = require("express");
const router = express.Router();

const chatbotController = require("../controllers/chatbot.controller");
const authMiddleware = require("../middleware/auth.middleware");

// POST /api/chatbot/message
router.post("/message", authMiddleware, chatbotController.sendMessage);

module.exports = router;