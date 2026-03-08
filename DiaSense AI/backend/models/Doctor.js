// diasense-ai-backend/models/Doctor.js (FULL REPLACE)

const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    /* -------------------------------------------------------------------------- */
    /* Basic Information                                                          */
    /* -------------------------------------------------------------------------- */
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      maxlength: 120,
    },

    hospital: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    experience: {
      type: Number,
      min: 0,
      default: 0,
    },

    fee: {
      type: Number,
      min: 0,
      default: 0,
    },

    /* -------------------------------------------------------------------------- */
    /* Availability Settings                                                      */
    /* -------------------------------------------------------------------------- */
    availableDays: {
      type: [String],
      default: [],
    },

    availableTimeSlots: {
      type: [String],
      default: [],
    },

    availableFrom: {
      type: Date,
      default: null,
    },

    availableTo: {
      type: Date,
      default: null,
    },

    /* -------------------------------------------------------------------------- */
    /* Profile Section                                                            */
    /* -------------------------------------------------------------------------- */
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Stored as: /uploads/doctors/filename.jpg
    image: {
      type: String,
      default: "",
    },

    /* -------------------------------------------------------------------------- */
    /* System Fields                                                              */
    /* -------------------------------------------------------------------------- */
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Optional: make searching easier (name/spec/bio)
doctorSchema.index({
  name: "text",
  specialization: "text",
  hospital: "text",
  location: "text",
  bio: "text",
});

module.exports = mongoose.model("Doctor", doctorSchema);