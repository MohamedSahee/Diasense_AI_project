// diasense-ai-backend/controllers/user.controller.js
const mongoose = require("mongoose");
const User = require("../models/User");

// never send password
const SAFE_SELECT = "-password";

// helper
const isSameId = (a, b) => String(a) === String(b);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

/**
 * ✅ ADMIN: Get all users
 * GET /api/users   (admin)
 */
exports.adminGetAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select(SAFE_SELECT)
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (err) {
    console.error("adminGetAllUsers error:", err);
    return res.status(500).json({ message: "Failed to load users" });
  }
};

/**
 * ✅ ADMIN: Get one user by id
 * GET /api/users/:id   (admin)
 * (Required for Admin Dashboard UserDetails page)
 */
exports.adminGetUserById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select(SAFE_SELECT);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("adminGetUserById error:", err);
    return res.status(500).json({ message: "Failed to load user" });
  }
};

/**
 * ✅ ADMIN: Delete a user
 * DELETE /api/users/admin/:id   (admin)
 */
exports.adminDeleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // prevent deleting self
    if (isSameId(req.user?.id, id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account" });
    }

    const deleted = await User.findByIdAndDelete(id).select(SAFE_SELECT);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User deleted", user: deleted });
  } catch (err) {
    console.error("adminDeleteUser error:", err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

/**
 * ✅ ADMIN: Update user role
 * PATCH /api/users/admin/:id/role   (admin)
 * body: { role: "admin" | "user" | "doctor" }
 */
exports.adminUpdateUserRole = async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const role = String(req.body?.role || "").trim().toLowerCase();

    // allow roles you support
    const allowed = ["admin", "user", "doctor"];
    if (!allowed.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed: ${allowed.join(", ")}`,
      });
    }

    // prevent changing self role
    if (isSameId(req.user?.id, id)) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Role updated", user: updated });
  } catch (err) {
    console.error("adminUpdateUserRole error:", err);
    return res.status(500).json({ message: "Failed to update role" });
  }
};

/**
 * ✅ ADMIN: Toggle user active status
 * PATCH /api/users/admin/:id/toggle   (admin)
 * - cannot disable self
 * - cannot disable other admins (safety)
 */
exports.adminToggleUserActive = async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // prevent disabling self
    if (isSameId(req.user?.id, id)) {
      return res
        .status(400)
        .json({ message: "You cannot disable your own admin account" });
    }

    // load role + isActive (password excluded anyway)
    const user = await User.findById(id).select(SAFE_SELECT);
    if (!user) return res.status(404).json({ message: "User not found" });

    // prevent disabling admins
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot disable an admin account" });
    }

    // if field doesn't exist yet, this will create it
    user.isActive = user.isActive === false ? true : false;
    await user.save();

    return res.json({ message: "User status updated", user });
  } catch (err) {
    console.error("adminToggleUserActive error:", err);
    return res.status(500).json({ message: "Failed to toggle user" });
  }
};