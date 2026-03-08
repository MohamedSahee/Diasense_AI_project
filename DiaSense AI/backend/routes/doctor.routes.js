// diasense-ai-backend/routes/doctor.routes.js
// ✅ FULL REPLACE (Safe Order + Image Upload + Admin Protection)

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const upload = require("../middleware/uploadDoctor"); // ✅ Multer upload

const {
  // Public
  getDoctors,
  getDoctorById,
  filterDoctors,

  // Admin
  adminAddDoctor,
  adminUpdateDoctor,
  adminDeleteDoctor,
  adminToggleDoctor,
  adminGetDoctorsWithStats,
} = require("../controllers/doctor.controller");

/* ========================================================================== */
/*                                ADMIN ROUTES                                */
/* ========================================================================== */
/* ⚠️ IMPORTANT: Always define admin routes BEFORE "/:id"                     */
/* ========================================================================== */

// ✅ Admin: Get all doctors with booking statistics
router.get(
  "/admin/stats",
  authMiddleware,
  adminMiddleware,
  adminGetDoctorsWithStats
);

// ✅ Admin: Create doctor (with image upload)
router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  upload.single("image"), // field name MUST be "image"
  adminAddDoctor
);

// ✅ Admin: Update doctor (optional image update)
router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  adminUpdateDoctor
);

// ✅ Admin: Delete doctor
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  adminDeleteDoctor
);

// ✅ Admin: Toggle active/inactive
router.patch(
  "/admin/:id/toggle",
  authMiddleware,
  adminMiddleware,
  adminToggleDoctor
);

/* ========================================================================== */
/*                                USER ROUTES                                 */
/* ========================================================================== */

// ✅ Filter doctors
// Remove authMiddleware if you want this public
router.get("/filter/search", authMiddleware, filterDoctors);

/* ========================================================================== */
/*                               PUBLIC ROUTES                                */
/* ========================================================================== */

// ✅ Get all doctors
// Default: only active doctors
// Optional: ?includeInactive=true
router.get("/", getDoctors);

// ✅ Get single doctor by ID (MUST BE LAST)
router.get("/:id", getDoctorById);

module.exports = router;