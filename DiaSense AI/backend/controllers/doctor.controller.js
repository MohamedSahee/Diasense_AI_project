// diasense-ai-backend/controllers/doctor.controller.js (FULL REPLACE)

const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const toStringSafe = (v) =>
  v === undefined || v === null ? "" : String(v).trim();

const toNumberSafe = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const toBooleanSafe = (v, def = true) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return def;
};

// ✅ Robust array parser:
// - accepts real array
// - accepts JSON string: '["Mon","Tue"]'
// - accepts CSV: "Mon, Tue"
const parseArrayFlexible = (value) => {
  if (!value) return [];

  // already array
  if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean);

  // must be string now
  const s = String(value).trim();
  if (!s) return [];

  // try JSON first
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {
    // ignore
  }

  // fallback CSV
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

// ✅ Only set update fields if user actually provided them
const setIfProvided = (obj, key, value) => {
  if (value === undefined || value === null) return;
  if (typeof value === "string" && value.trim() === "") return;
  obj[key] = value;
};

/* -------------------------------------------------------------------------- */
/*                            PUBLIC (FRONTEND)                               */
/* -------------------------------------------------------------------------- */

// GET /api/doctors
exports.getDoctors = async (req, res) => {
  try {
    const includeInactive =
      String(req.query.includeInactive).toLowerCase() === "true";

    const filter = includeInactive ? {} : { isActive: true };

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });

    res.status(200).json(doctors);
  } catch (err) {
    console.error("getDoctors error:", err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json(doctor);
  } catch (err) {
    console.error("getDoctorById error:", err);
    res.status(500).json({ message: "Failed to fetch doctor" });
  }
};

// GET /api/doctors/filter/search
exports.filterDoctors = async (req, res) => {
  try {
    const { specialization, maxFee } = req.query;

    const filter = { isActive: true };

    if (specialization) filter.specialization = specialization;
    if (maxFee) filter.fee = { $lte: Number(maxFee) };

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });

    res.status(200).json(doctors);
  } catch (err) {
    console.error("filterDoctors error:", err);
    res.status(500).json({ message: "Failed to filter doctors" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                ADMIN CRUD                                  */
/* -------------------------------------------------------------------------- */

// POST /api/doctors/admin
exports.adminAddDoctor = async (req, res) => {
  try {
    const payload = req.body;

    // ✅ debug (remove later if you want)
    // console.log("ADD DOCTOR BODY:", payload);
    // console.log("ADD DOCTOR FILE:", req.file);

    const imagePath = req.file ? `/uploads/doctors/${req.file.filename}` : "";

    // Support both fields:
    // - admin sends availableTime (string)
    // - older code uses availableTimeSlots (array)
    const availableTimeSlots =
      parseArrayFlexible(payload.availableTimeSlots).length > 0
        ? parseArrayFlexible(payload.availableTimeSlots)
        : parseArrayFlexible(payload.availableTime); // if "10AM - 2PM" it becomes ["10AM - 2PM"]

    const doctor = await Doctor.create({
      name: toStringSafe(payload.name),
      specialization: toStringSafe(payload.specialization),
      hospital: toStringSafe(payload.hospital),
      location: toStringSafe(payload.location),
      bio: toStringSafe(payload.bio),

      experience: toNumberSafe(payload.experience),
      fee: toNumberSafe(payload.fee),

      // ✅ FIX: parse JSON or CSV
      availableDays: parseArrayFlexible(payload.availableDays),

      // ✅ FIX: support your admin field
      availableTimeSlots,

      availableFrom: payload.availableFrom || null,
      availableTo: payload.availableTo || null,

      // ✅ IMPORTANT: save relative path for frontend
      image: imagePath,

      isActive:
        payload.isActive !== undefined ? toBooleanSafe(payload.isActive) : true,
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (err) {
    console.error("adminAddDoctor error:", err);
    res.status(500).json({
      message: "Failed to create doctor",
      error: err.message,
    });
  }
};

// PUT /api/doctors/admin/:id
exports.adminUpdateDoctor = async (req, res) => {
  try {
    const payload = req.body;

    // ✅ debug (remove later if you want)
    // console.log("UPDATE DOCTOR BODY:", payload);
    // console.log("UPDATE DOCTOR FILE:", req.file);

    const updateData = {};

    // ✅ Only set fields if provided (prevents wiping fields with empty string)
    setIfProvided(updateData, "name", toStringSafe(payload.name));
    setIfProvided(updateData, "specialization", toStringSafe(payload.specialization));
    setIfProvided(updateData, "hospital", toStringSafe(payload.hospital));
    setIfProvided(updateData, "location", toStringSafe(payload.location));
    setIfProvided(updateData, "bio", toStringSafe(payload.bio));

    if (payload.experience !== undefined && payload.experience !== "") {
      updateData.experience = toNumberSafe(payload.experience);
    }
    if (payload.fee !== undefined && payload.fee !== "") {
      updateData.fee = toNumberSafe(payload.fee);
    }

    if (payload.availableDays !== undefined) {
      updateData.availableDays = parseArrayFlexible(payload.availableDays);
    }

    // ✅ support both fields
    if (payload.availableTimeSlots !== undefined || payload.availableTime !== undefined) {
      const slots =
        parseArrayFlexible(payload.availableTimeSlots).length > 0
          ? parseArrayFlexible(payload.availableTimeSlots)
          : parseArrayFlexible(payload.availableTime);

      updateData.availableTimeSlots = slots;
    }

    if (payload.availableFrom !== undefined) {
      updateData.availableFrom = payload.availableFrom || null;
    }
    if (payload.availableTo !== undefined) {
      updateData.availableTo = payload.availableTo || null;
    }

    if (payload.isActive !== undefined) {
      updateData.isActive = toBooleanSafe(payload.isActive);
    }

    // ✅ If new image uploaded, replace image path
    if (req.file) {
      updateData.image = `/uploads/doctors/${req.file.filename}`;
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (err) {
    console.error("adminUpdateDoctor error:", err);
    res.status(500).json({
      message: "Failed to update doctor",
      error: err.message,
    });
  }
};

// DELETE /api/doctors/admin/:id
exports.adminDeleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("adminDeleteDoctor error:", err);
    res.status(500).json({ message: "Failed to delete doctor" });
  }
};

// PATCH /api/doctors/admin/:id/toggle
exports.adminToggleDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isActive = !doctor.isActive;
    await doctor.save();

    res.status(200).json({
      message: "Doctor status updated successfully",
      doctor,
    });
  } catch (err) {
    console.error("adminToggleDoctor error:", err);
    res.status(500).json({ message: "Failed to toggle doctor" });
  }
};

/* -------------------------------------------------------------------------- */
/*                              ADMIN STATS                                   */
/* -------------------------------------------------------------------------- */

// GET /api/doctors/admin/stats
exports.adminGetDoctorsWithStats = async (req, res) => {
  try {
    const doctors = await Doctor.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "doctor",
          as: "appointments",
        },
      },
      {
        $addFields: {
          bookingCount: { $size: "$appointments" },
        },
      },
      {
        $project: {
          appointments: 0,
        },
      },
    ]);

    res.status(200).json(doctors);
  } catch (err) {
    console.error("adminGetDoctorsWithStats error:", err);
    res.status(500).json({ message: "Failed to load doctor stats" });
  }
};