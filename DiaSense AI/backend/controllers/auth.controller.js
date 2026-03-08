// diasense-ai-backend/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------- helpers ----------------
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function safeUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive !== false, // ✅ include for UI logic if needed
  };
}

function toStr(v) {
  return v === undefined || v === null ? "" : String(v);
}

// ✅ POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const name = toStr(req.body?.name).trim();
    const email = toStr(req.body?.email).trim().toLowerCase();
    const password = toStr(req.body?.password);

    // basic validation
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check existing
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    // create user (password hashing in model)
    const user = await User.create({
      name,
      email,
      password,
      // role: "user" (default)
      // isActive: true (default)
    });

    return res.status(201).json({
      message: "Registration successful",
      token: signToken(user),
      user: safeUserPayload(user),
    });
  } catch (err) {
    // mongoose validation
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    // duplicate key (email)
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    console.error("register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const email = toStr(req.body?.email).trim().toLowerCase();
    const password = toStr(req.body?.password);

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    // select +password because schema sets select:false
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // ✅ NEW FIX: block disabled users
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is disabled. Contact admin." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    return res.json({
      message: "Login successful",
      token: signToken(user),
      user: safeUserPayload(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET /api/auth/me (protected)
exports.me = async (req, res) => {
  try {
    const userId = req.user?.id; // auth.middleware sets req.user
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ if admin disabled this account after login, force deny
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is disabled. Contact admin." });
    }

    return res.json(safeUserPayload(user));
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};