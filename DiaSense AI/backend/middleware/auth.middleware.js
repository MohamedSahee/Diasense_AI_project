const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET not set in .env" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, role, iat, exp }
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};