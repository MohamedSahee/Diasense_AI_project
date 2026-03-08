// diasense-ai-backend/controllers/appointment.controller.js (FULL REPLACE)

const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

/* ------------------------- helpers ------------------------- */
const toStr = (v) => (v === undefined || v === null ? "" : String(v).trim());

function toDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

function isDuplicateKeyError(err) {
  return err && (err.code === 11000 || err.code === 11001);
}

function looksLikeIndexError(err) {
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("index") ||
    msg.includes("e11000") ||
    msg.includes("duplicate key") ||
    msg.includes("already exists")
  );
}

async function populateAppointmentById(id) {
  return Appointment.findById(id)
    .populate("user", "name email role isActive createdAt")
    .populate(
      "doctor",
      "name specialization fee availableDays availableTimeSlots availableTime image isActive"
    );
}

/*
|--------------------------------------------------------------------------
| USER FUNCTIONS
|--------------------------------------------------------------------------
*/

// ✅ POST /api/appointments
exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const doctorId = toStr(req.body?.doctorId);
    const appointmentDateRaw = req.body?.appointmentDate;
    const timeSlot = toStr(req.body?.timeSlot);
    const reason = toStr(req.body?.reason);

    if (!doctorId) return res.status(400).json({ message: "doctorId is required" });
    if (!appointmentDateRaw)
      return res.status(400).json({ message: "appointmentDate is required" });
    if (!timeSlot) return res.status(400).json({ message: "timeSlot is required" });

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId format" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (doctor.isActive === false) {
      return res
        .status(400)
        .json({ message: "Doctor is busy/inactive. Cannot book now." });
    }

    const parsedDate = toDate(appointmentDateRaw);
    if (!parsedDate) {
      return res.status(400).json({
        message: "appointmentDate must be a valid date (YYYY-MM-DD)",
      });
    }

    // ✅ Normalize to UTC start-of-day
    const day = startOfDayUTC(parsedDate);

    // ✅ Pre-check duplicate (ignore cancelled)
    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: day,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      return res.status(409).json({
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    // ✅ Create appointment
    const appt = await Appointment.create({
      user: userId,
      doctor: doctorId,
      doctorName: doctor.name || "",
      specialization: doctor.specialization || "",
      fee: doctor.fee || 0,
      appointmentDate: day,
      timeSlot,
      reason,
      status: "pending",
    });

    let populated = appt;
    try {
      populated = await populateAppointmentById(appt._id);
    } catch (popErr) {
      console.warn("⚠️ populate failed, returning raw appointment:", popErr?.message || popErr);
    }

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populated,
    });
  } catch (err) {
    console.error("❌ bookAppointment error:", err);

    if (isDuplicateKeyError(err)) {
      return res.status(409).json({
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    if (err?.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid appointment data",
        error: process.env.NODE_ENV === "production" ? undefined : err.message,
      });
    }

    if (looksLikeIndexError(err)) {
      return res.status(500).json({
        message:
          "Booking failed due to MongoDB index conflict. Fix: MongoDB Compass → diasense → appointments → Indexes → delete old doctor_1_appointmentDate_1_timeSlot_1 / uniq_* indexes, then restart backend.",
        error: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
      });
    }

    return res.status(500).json({
      message: "Booking failed",
      error: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
    });
  }
};

// ✅ GET /api/appointments/my
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const appts = await Appointment.find({ user: userId })
      .populate(
        "doctor",
        "name specialization fee availableDays availableTimeSlots availableTime image isActive"
      )
      .sort({ appointmentDate: 1, createdAt: -1 });

    return res.json(appts);
  } catch (err) {
    console.error("❌ getMyAppointments error:", err);
    return res.status(500).json({ message: "Failed to load appointments" });
  }
};

// ✅ PUT /api/appointments/:id/cancel  (only owner)
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid appointment id" });

    const appt = await Appointment.findOne({ _id: id, user: userId });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.status = "cancelled";
    await appt.save();

    let populated = appt;
    try {
      populated = await populateAppointmentById(appt._id);
    } catch {}

    return res.json({ message: "Appointment cancelled", appointment: populated });
  } catch (err) {
    console.error("❌ cancelAppointment error:", err);
    return res.status(500).json({ message: "Cancel failed" });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN FUNCTIONS
|--------------------------------------------------------------------------
*/

// ✅ GET /api/appointments/admin
// ✅ supports filtering: /api/appointments/admin?userId=xxxx&doctorId=yyyy&status=pending
exports.adminGetAllAppointments = async (req, res) => {
  try {
    const { userId, doctorId, status } = req.query;

    const filter = {};

    if (userId) {
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });
      filter.user = userId;
    }

    if (doctorId) {
      if (!isValidObjectId(doctorId)) return res.status(400).json({ message: "Invalid doctorId" });
      filter.doctor = doctorId;
    }

    if (status) {
      const s = toStr(status).toLowerCase();
      const allowed = ["pending", "confirmed", "cancelled"];
      if (!allowed.includes(s)) return res.status(400).json({ message: "Invalid status filter" });
      filter.status = s;
    }

    const appts = await Appointment.find(filter)
      .populate("user", "name email")
      .populate("doctor", "name specialization fee isActive")
      .sort({ appointmentDate: -1, createdAt: -1 });

    return res.json(appts);
  } catch (err) {
    console.error("❌ adminGetAllAppointments error:", err);
    return res.status(500).json({ message: "Failed to load all appointments" });
  }
};

// ✅ GET /api/appointments/admin/doctor/:doctorId
exports.adminGetAppointmentsByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!isValidObjectId(doctorId)) return res.status(400).json({ message: "Invalid doctor id" });

    const doctor = await Doctor.findById(doctorId).select("name specialization");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appts = await Appointment.find({ doctor: doctorId })
      .populate("user", "name email")
      .populate("doctor", "name specialization fee isActive")
      .sort({ appointmentDate: -1, createdAt: -1 });

    return res.json(appts);
  } catch (err) {
    console.error("❌ adminGetAppointmentsByDoctor error:", err);
    return res.status(500).json({ message: "Failed to load doctor appointments" });
  }
};

// ✅ GET /api/appointments/admin/user/:userId
exports.adminGetAppointmentsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid user id" });

    const appts = await Appointment.find({ user: userId })
      .populate("user", "name email")
      .populate("doctor", "name specialization fee isActive")
      .sort({ appointmentDate: -1, createdAt: -1 });

    return res.json(appts);
  } catch (err) {
    console.error("❌ adminGetAppointmentsByUser error:", err);
    return res.status(500).json({ message: "Failed to load user appointments" });
  }
};

// ✅ PATCH /api/appointments/admin/:id/status
exports.adminUpdateAppointmentStatus = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid appointment id" });

    const status = toStr(req.body?.status).toLowerCase();
    const allowed = ["pending", "confirmed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const appt = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("doctor", "name specialization fee isActive");

    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ message: "Status updated", appointment: appt });
  } catch (err) {
    console.error("❌ adminUpdateAppointmentStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// ✅ DELETE /api/appointments/admin/:id  (permanent delete)
exports.adminDeleteAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid appointment id" });

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ message: "Appointment deleted successfully", appointmentId: id });
  } catch (err) {
    console.error("❌ adminDeleteAppointment error:", err);
    return res.status(500).json({ message: "Failed to delete appointment" });
  }
};