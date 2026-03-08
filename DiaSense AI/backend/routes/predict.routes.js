// diasense-ai-backend/routes/predict.routes.js (FULL REPLACE)
// ✅ User: predict + history
// ✅ Admin: list all predictions + per user + delete
// ✅ Protected with JWT + Admin middleware for admin routes

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  // User
  predict,
  history,

  // Admin
  adminGetAllPredictions,
  adminGetPredictionsByUser,
  adminDeletePrediction,
} = require("../controllers/predict.controller");

/* -------------------------------------------------------------------------- */
/*                                  USER                                      */
/* -------------------------------------------------------------------------- */

// ✅ POST /api/predict  (User prediction)
router.post("/", authMiddleware, predict);

// ✅ GET /api/predict/history  (User history)
router.get("/history", authMiddleware, history);

/* -------------------------------------------------------------------------- */
/*                                  ADMIN                                     */
/* -------------------------------------------------------------------------- */
/**
 * IMPORTANT:
 * Keep "/admin/..." routes before any future "/:id" routes (if you add them later)
 */

// ✅ GET /api/predict/admin?q=&riskLevel=low|moderate|high  (All predictions)
router.get("/admin", authMiddleware, adminMiddleware, adminGetAllPredictions);

// ✅ GET /api/predict/admin/user/:userId  (Predictions by user)
router.get(
  "/admin/user/:userId",
  authMiddleware,
  adminMiddleware,
  adminGetPredictionsByUser
);

// ✅ DELETE /api/predict/admin/:id  (Delete one prediction)
router.delete("/admin/:id", authMiddleware, adminMiddleware, adminDeletePrediction);

module.exports = router;