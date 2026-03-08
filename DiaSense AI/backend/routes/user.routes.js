// diasense-ai-backend/routes/user.routes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  adminGetAllUsers,
  adminGetUserById,      // ✅ ADD
  adminDeleteUser,
  adminUpdateUserRole,
  adminToggleUserActive,
} = require("../controllers/user.controller");

/* -------------------------------------------------------------------------- */
/*                               USER ROUTES                                  */
/* -------------------------------------------------------------------------- */

// ✅ GET /api/users/profile
// NOTE: Keep this BEFORE "/:id" routes
router.get("/profile", authMiddleware, (req, res) => {
  return res.json({
    message: "Access granted",
    user: req.user,
  });
});

/* -------------------------------------------------------------------------- */
/*                              ADMIN ROUTES                                  */
/* -------------------------------------------------------------------------- */
/**
 * These routes are mounted at:
 * app.use("/api/users", router)
 *
 * Admin Dashboard calls:
 * - GET    /api/users            (list users)
 * - GET    /api/users/:id        (single user details ✅ REQUIRED)
 * - PATCH  /api/users/:id/role
 * - PATCH  /api/users/:id/toggle
 * - DELETE /api/users/:id
 */

// ✅ Admin: Get ALL users
router.get("/", authMiddleware, adminMiddleware, adminGetAllUsers);

// ✅ Admin: Get ONE user (UserDetails page needs this)
router.get("/:id", authMiddleware, adminMiddleware, adminGetUserById);

// ✅ Admin: Update role  body: { role: "admin" | "user" | "doctor" }
router.patch("/:id/role", authMiddleware, adminMiddleware, adminUpdateUserRole);

// ✅ Admin: Toggle user active/inactive
router.patch("/:id/toggle", authMiddleware, adminMiddleware, adminToggleUserActive);

// ✅ Admin: Delete user
router.delete("/:id", authMiddleware, adminMiddleware, adminDeleteUser);

module.exports = router;