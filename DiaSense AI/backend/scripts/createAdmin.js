// diasense-ai-backend/scripts/createAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  let connected = false;

  try {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!MONGO_URI) {
      console.error("❌ Missing MONGO_URI in backend .env file");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    connected = true;
    console.log("✅ Connected to MongoDB");

    // ✅ Change these if you want
    const name = "Admin";
    const email = "admin@diasense.com";
    const plainPassword = "Admin@12345";

    // Find existing admin user
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("⚠️ Admin already exists -> Resetting password + setting role=admin...");

      existing.name = name;
      existing.role = "admin";

      // ✅ IMPORTANT: DO NOT hash here
      // Your User model pre("save") will hash automatically
      existing.password = plainPassword;

      await existing.save();

      console.log("✅ Admin updated successfully!");
    } else {
      // ✅ IMPORTANT: DO NOT hash here
      // User model pre("save") will hash automatically
      await User.create({
        name,
        email,
        password: plainPassword,
        role: "admin",
      });

      console.log("✅ Admin created successfully!");
    }

    console.log("--------------------------------------------------");
    console.log("✅ Admin login credentials:");
    console.log("Email:", email);
    console.log("Password:", plainPassword);
    console.log("--------------------------------------------------");

    process.exit(0);
  } catch (err) {
    // Better error messages
    if (err?.code === 11000) {
      console.error("❌ Duplicate email error (already exists):", err?.keyValue);
    } else {
      console.error("❌ Error:", err);
    }
    process.exit(1);
  } finally {
    if (connected) {
      await mongoose.disconnect().catch(() => {});
    }
  }
}

main();