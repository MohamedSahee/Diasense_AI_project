// diasense-ai-backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password unless explicitly selected
    },

    // ✅ Use this for admin gating in dashboard
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
      index: true,
    },

    // ✅ NEW: admin can disable a user (block login / actions)
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * ✅ Normalize email before save
 */
userSchema.pre("save", function () {
  if (this.email) this.email = String(this.email).trim().toLowerCase();
});

/**
 * 🔐 Hash password before saving
 * - no next() needed because we use async function without next param
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * 🔑 Compare password during login
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(String(enteredPassword || ""), this.password);
};

/**
 * ✅ Remove password from JSON output always
 */
userSchema.set("toJSON", {
  transform: function (_doc, ret) {
    delete ret.password;
    return ret;
  },
});

/**
 * ✅ Remove password from Object output always
 */
userSchema.set("toObject", {
  transform: function (_doc, ret) {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);