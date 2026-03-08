// diasense-ai-backend/middleware/admin.middleware.js
const User = require("../models/User");

module.exports = async function adminMiddleware(req, res, next) {
  try {
    // auth.middleware must set: req.user = { id, role, email, iat, exp }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }

    // ✅ Fast path: role included inside JWT
    if (req.user?.role) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only access" });
      }
      return next();
    }

    // ✅ Fallback: if token does not include role (older tokens)
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    return next();
  } catch (err) {
    console.error("admin.middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};