// diasense-ai-backend/routes/appointment.routes.js (FULL REPLACE)

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  // User
  bookAppointment,
  getMyAppointments,
  cancelAppointment,

  // Admin
  adminGetAllAppointments,
  adminGetAppointmentsByDoctor,
  adminGetAppointmentsByUser, // ✅ NEW (per-user bookings)
  adminUpdateAppointmentStatus,
  adminDeleteAppointment, // ✅ NEW (permanent delete)
} = require("../controllers/appointment.controller");

/*
|--------------------------------------------------------------------------
| USER ROUTES (JWT required)
|--------------------------------------------------------------------------
*/

// ✅ Book an appointment
router.post("/", authMiddleware, bookAppointment);

// ✅ Get logged-in user's appointments
router.get("/my", authMiddleware, getMyAppointments);

// ✅ Cancel appointment (only owner)
router.put("/:id/cancel", authMiddleware, cancelAppointment);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES (JWT + Admin required)
| IMPORTANT: keep "/admin/..." routes BEFORE any future "/:id" GET routes
|--------------------------------------------------------------------------
*/

// ✅ Admin: Get ALL appointments
router.get("/admin", authMiddleware, adminMiddleware, adminGetAllAppointments);

// ✅ Admin: Get all appointments for a specific doctor
router.get(
  "/admin/doctor/:doctorId",
  authMiddleware,
  adminMiddleware,
  adminGetAppointmentsByDoctor
);

// ✅ NEW: Admin: Get all appointments for a specific user
router.get(
  "/admin/user/:userId",
  authMiddleware,
  adminMiddleware,
  adminGetAppointmentsByUser
);

// ✅ Admin: Update appointment status (pending | confirmed | cancelled)
router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  adminUpdateAppointmentStatus
);

// ✅ NEW: Admin Delete appointment permanently
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  adminDeleteAppointment
);

module.exports = router;