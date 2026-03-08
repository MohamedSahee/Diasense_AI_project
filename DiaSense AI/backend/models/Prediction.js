// diasense-ai-backend/models/Prediction.js
const mongoose = require("mongoose");

const FactorSchema = new mongoose.Schema(
  {
    key: { type: String, default: "" }, // e.g., "Glucose"
    value: { type: mongoose.Schema.Types.Mixed, default: 0 }, // supports number/decimal safely
    unit: { type: String, default: "" }, // e.g., "mg/dL"
    status: { type: String, default: "" }, // "normal" | "borderline" | "high"
    note: { type: String, default: "" }, // explanation line
  },
  { _id: false }
);

const RecommendationSchema = new mongoose.Schema(
  {
    diet: { type: [String], default: [] },
    activity: { type: [String], default: [] },
    lifestyle: { type: [String], default: [] },
    monitoring: { type: [String], default: [] },
  },
  { _id: false }
);

const PredictionSchema = new mongoose.Schema(
  {
    // Link to the user who made this prediction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    gender: { type: String, enum: ["male", "female"], required: true },

    // Inputs
    pregnancies: { type: Number, default: 0 },
    glucose: { type: Number, required: true },
    bloodPressure: { type: Number, required: true },
    skinThickness: { type: Number, default: 0 },
    insulin: { type: Number, default: 0 },
    bmi: { type: Number, required: true },
    diabetesPedigree: { type: Number, default: 0 },
    age: { type: Number, required: true },
    symptoms: { type: String, default: "" },

    // Outputs
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // 0–100
    },
    riskLevel: { type: String, enum: ["low", "moderate", "high"], required: true },
    prediction: { type: String, required: true },

    // Raw model response (probability, label, prediction, etc.)
    modelOutput: { type: mongoose.Schema.Types.Mixed, default: {} },

    // "Why this result?"
    factors: { type: [FactorSchema], default: [] },

    // Personalized recommendations (always an object with arrays)
    recommendations: {
      type: RecommendationSchema,
      default: () => ({
        diet: [],
        activity: [],
        lifestyle: [],
        monitoring: [],
      }),
    },
  },
  { timestamps: true }
);

// Helpful indexes for admin pages (fast filtering)
PredictionSchema.index({ createdAt: -1 });
PredictionSchema.index({ riskLevel: 1 });

module.exports = mongoose.model("Prediction", PredictionSchema);