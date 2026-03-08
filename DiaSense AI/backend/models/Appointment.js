// diasense-ai-backend/models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Who booked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    // Which doctor
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
      index: true,
    },

    // Snapshot fields
    doctorName: { type: String, trim: true, default: "" },
    specialization: { type: String, trim: true, default: "" },
    fee: { type: Number, min: 0, default: 0 },

    // Date of appointment (store as UTC start-of-day)
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
      index: true,
    },

    // Slot like "10:00 AM"
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * ✅ Normalize fields before validation
 * IMPORTANT: NO `next` callback here
 * Fixes: TypeError: next is not a function
 */
appointmentSchema.pre("validate", function () {
  // normalize appointmentDate to UTC start-of-day
  if (
    this.appointmentDate instanceof Date &&
    !Number.isNaN(this.appointmentDate.getTime())
  ) {
    const d = new Date(this.appointmentDate);
    d.setUTCHours(0, 0, 0, 0);
    this.appointmentDate = d;
  }

  if (typeof this.timeSlot === "string") {
    this.timeSlot = this.timeSlot.trim();
  }

  if (typeof this.reason === "string") {
    this.reason = this.reason.trim();
  }

  if (typeof this.doctorName === "string") {
    this.doctorName = this.doctorName.trim();
  }

  if (typeof this.specialization === "string") {
    this.specialization = this.specialization.trim();
  }
});

/**
 * ✅ Prevent duplicate bookings for active appointments:
 * same doctor + same date + same timeSlot cannot be double-booked
 * cancelled bookings won't block re-booking
 */
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
    name: "uniq_doctor_date_slot_active",
  }
);

// Helpful indexes
appointmentSchema.index({ doctor: 1, status: 1, appointmentDate: -1 });
appointmentSchema.index({ user: 1, appointmentDate: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);