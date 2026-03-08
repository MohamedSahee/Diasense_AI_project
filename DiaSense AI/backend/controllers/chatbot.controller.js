const axios = require("axios");

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const mlUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

    // Call your trained chatbot in ML-Service
    const r = await axios.post(`${mlUrl}/chatbot`, { message });

    // r.data should be: { intent, confidence, reply }
    return res.json(r.data);
  } catch (err) {
    console.error("Chatbot API error:", err?.message || err);
    return res.status(500).json({
      reply: "Chatbot service unavailable right now. Please try again.",
    });
  }
};