const axios = require("axios");
const Prediction = require("../models/Prediction");

const ML_BASE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// ---------------- helpers ----------------
function toNum(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const toStr = (v) => (v === undefined || v === null ? "" : String(v).trim());

function uniqTop(arr, max = 6) {
  return [...new Set(arr.filter(Boolean))].slice(0, max);
}

// IMPORTANT: keep DB-safe enum values
function getRiskLevel(score) {
  if (score >= 70) return "high";
  if (score >= 35) return "moderate";
  return "low";
}

function buildPredictionLabel(score) {
  if (score >= 70) return "Diabetic Risk High";
  if (score >= 35) return "Diabetic Risk Moderate";
  return "Diabetic Risk Low";
}

function getModelProbability(modelResult) {
  if (
    typeof modelResult?.probability === "number" &&
    Number.isFinite(modelResult.probability)
  ) {
    return clamp(modelResult.probability, 0, 1);
  }

  if (modelResult?.prediction === 1) return 0.75;
  if (modelResult?.prediction === 0) return 0.25;

  return 0.5;
}

// ---------------- Better personalized recommendations ----------------
function buildRecommendations(data, riskScore) {
  const {
    glucose = 0,
    bmi = 0,
    bloodPressure = 0,
    age = 0,
    pregnancies = 0,
    gender = "",
  } = data;

  const recommendations = {
    diet: [],
    activity: [],
    lifestyle: [],
    monitoring: [],
  };

  // Diet
  if (glucose >= 140) {
    recommendations.diet.push(
      "Reduce sugar intake and avoid sweetened drinks."
    );
    recommendations.diet.push(
      "Follow a low-glycemic diet with vegetables, whole grains, and lean protein."
    );
  } else if (glucose >= 100) {
    recommendations.diet.push(
      "Limit processed carbohydrates and maintain balanced meals."
    );
  } else {
    recommendations.diet.push(
      "Maintain a balanced diet with healthy portions and regular meal timing."
    );
  }

  if (bmi >= 30) {
    recommendations.diet.push(
      "Focus on calorie control and healthy weight reduction under guidance."
    );
  } else if (bmi >= 25) {
    recommendations.diet.push(
      "Choose a nutritious weight-management diet to reduce future risk."
    );
  }

  // Activity
  if (riskScore >= 70) {
    recommendations.activity.push(
      "Aim for at least 30 minutes of moderate physical activity on most days."
    );
    recommendations.activity.push(
      "Start gradually with walking or light exercise if not physically active."
    );
  } else if (riskScore >= 35) {
    recommendations.activity.push(
      "Maintain regular exercise 4–5 days per week."
    );
  } else {
    recommendations.activity.push(
      "Continue a healthy routine with regular walking and light exercise."
    );
  }

  // Lifestyle
  if (bmi >= 25) {
    recommendations.lifestyle.push(
      "Weight reduction can significantly lower diabetes risk."
    );
  }

  if (bloodPressure >= 90) {
    recommendations.lifestyle.push(
      "Reduce salt intake and manage blood pressure with a healthy lifestyle."
    );
  }

  if (age >= 45) {
    recommendations.lifestyle.push(
      "Because age increases diabetes risk, maintain consistent screening and lifestyle control."
    );
  }

  if (pregnancies > 2) {
    recommendations.lifestyle.push(
      "Monitor metabolic health carefully, especially if there is a pregnancy-related diabetes history."
    );
  }

  if (gender === "female" && pregnancies >= 4) {
    recommendations.lifestyle.push(
      "Regular follow-up is recommended because multiple pregnancies may increase diabetes-related risk."
    );
  }

  recommendations.lifestyle.push(
    "Maintain good sleep, manage stress, and avoid smoking or alcohol misuse."
  );

  // Monitoring
  if (riskScore >= 70) {
    recommendations.monitoring.push(
      "Consult a doctor soon for proper clinical evaluation and confirmatory testing."
    );
    recommendations.monitoring.push(
      "Check fasting blood sugar and HbA1c as recommended by a healthcare provider."
    );
  } else if (riskScore >= 35) {
    recommendations.monitoring.push(
      "Repeat glucose monitoring periodically and discuss results with a clinician if values remain elevated."
    );
  } else {
    recommendations.monitoring.push(
      "Continue routine annual health checkups and preventive screening."
    );
  }

  return {
    diet: uniqTop(recommendations.diet, 6),
    activity: uniqTop(recommendations.activity, 6),
    lifestyle: uniqTop(recommendations.lifestyle, 6),
    monitoring: uniqTop(recommendations.monitoring, 6),
  };
}

// ---------------- Better factors based on actual values ----------------
function buildFactors(data) {
  const factors = [];

  if (data.glucose >= 140) {
    factors.push({
      label: "Glucose",
      value: data.glucose,
      impact: "High Impact",
      description: "Glucose level is significantly elevated.",
    });
  } else if (data.glucose >= 100) {
    factors.push({
      label: "Glucose",
      value: data.glucose,
      impact: "Moderate Impact",
      description: "Glucose level is slightly above the normal range.",
    });
  } else {
    factors.push({
      label: "Glucose",
      value: data.glucose,
      impact: "Low Impact",
      description: "Glucose is within a safer range.",
    });
  }

  if (data.bmi >= 30) {
    factors.push({
      label: "BMI",
      value: data.bmi,
      impact: "High Impact",
      description:
        "BMI is in the obesity range, which increases diabetes risk.",
    });
  } else if (data.bmi >= 25) {
    factors.push({
      label: "BMI",
      value: data.bmi,
      impact: "Moderate Impact",
      description: "BMI is above the healthy range.",
    });
  } else {
    factors.push({
      label: "BMI",
      value: data.bmi,
      impact: "Low Impact",
      description: "BMI is within the healthy range.",
    });
  }

  if (data.bloodPressure >= 90) {
    factors.push({
      label: "Blood Pressure",
      value: data.bloodPressure,
      impact: "Moderate Impact",
      description: "Blood pressure is elevated and should be monitored.",
    });
  } else if (data.bloodPressure >= 80) {
    factors.push({
      label: "Blood Pressure",
      value: data.bloodPressure,
      impact: "Low to Moderate Impact",
      description: "Blood pressure is slightly above the ideal range.",
    });
  } else {
    factors.push({
      label: "Blood Pressure",
      value: data.bloodPressure,
      impact: "Low Impact",
      description: "Blood pressure is within a safer range.",
    });
  }

  if (data.age >= 45) {
    factors.push({
      label: "Age",
      value: data.age,
      impact: "Moderate Impact",
      description: "Age is a contributing diabetes risk factor.",
    });
  } else if (data.age >= 35) {
    factors.push({
      label: "Age",
      value: data.age,
      impact: "Low to Moderate Impact",
      description: "Age contributes slightly to the overall risk profile.",
    });
  } else {
    factors.push({
      label: "Age",
      value: data.age,
      impact: "Low Impact",
      description: "Age contributes less to diabetes risk at younger values.",
    });
  }

  if (data.pregnancies > 2) {
    factors.push({
      label: "Pregnancies",
      value: data.pregnancies,
      impact: "Low to Moderate Impact",
      description: "Pregnancy history can influence diabetes risk.",
    });
  }

  return factors;
}

// ---------------- USER: predict ----------------
exports.predict = async (req, res) => {
  try {
    const {
      gender,
      pregnancies,
      glucose,
      bloodPressure,
      skinThickness,
      insulin,
      bmi,
      diabetesPedigree,
      age,
      symptoms,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const g = String(gender || "").toLowerCase().trim();
    if (!["male", "female"].includes(g)) {
      return res
        .status(400)
        .json({ message: "gender must be 'male' or 'female'" });
    }

    const payload = {
      gender: g,
      pregnancies: toNum(pregnancies, 0),
      glucose: toNum(glucose),
      bloodPressure: toNum(bloodPressure),
      skinThickness: toNum(skinThickness, 0),
      insulin: toNum(insulin, 0),
      bmi: toNum(bmi),
      diabetesPedigree: toNum(diabetesPedigree, 0),
      age: toNum(age),
    };

    if (
      ![payload.glucose, payload.bloodPressure, payload.bmi, payload.age].every(
        Number.isFinite
      )
    ) {
      return res.status(400).json({
        message: "age, bmi, glucose, bloodPressure must be valid numbers",
      });
    }

    // call ML service
    let modelResult = {};
    try {
      const mlRes = await axios.post(`${ML_BASE_URL}/predict`, payload, {
        timeout: 8000,
      });
      modelResult = mlRes.data || {};
    } catch (err) {
      const details = err?.response?.data || err.message;
      return res.status(500).json({ message: "ML service error", details });
    }

    const probability = getModelProbability(modelResult);
    const riskScore = Number((probability * 100).toFixed(2));
    const riskLevel = getRiskLevel(riskScore);
    const predictionText = buildPredictionLabel(riskScore);

    const factorSummary = buildFactors({
      glucose: payload.glucose,
      bmi: payload.bmi,
      bloodPressure: payload.bloodPressure,
      age: payload.age,
      pregnancies: payload.pregnancies,
    });

    const recommendations = buildRecommendations(
      {
        glucose: payload.glucose,
        bmi: payload.bmi,
        bloodPressure: payload.bloodPressure,
        age: payload.age,
        pregnancies: payload.pregnancies,
        gender: payload.gender,
      },
      riskScore
    );

    const saved = await Prediction.create({
      user: userId,

      gender: payload.gender,
      pregnancies: payload.pregnancies,
      glucose: payload.glucose,
      bloodPressure: payload.bloodPressure,
      skinThickness: payload.skinThickness,
      insulin: payload.insulin,
      bmi: payload.bmi,
      diabetesPedigree: payload.diabetesPedigree,
      age: payload.age,
      symptoms: String(symptoms ?? ""),

      riskScore,
      riskLevel,
      prediction: predictionText,

      modelOutput: {
        ...modelResult,
        probability,
        label: modelResult?.label || predictionText,
      },
      factors: factorSummary,
      recommendations,
    });

    return res.json({
      message: "Prediction completed successfully",
      prediction: predictionText,
      riskScore,
      riskLevel,
      model: {
        probability,
        label: modelResult?.label || predictionText,
      },
      factors: factorSummary,
      recommendations,
      savedId: saved._id,
    });
  } catch (error) {
    console.error("predict error:", error);
    return res.status(500).json({ message: "Prediction error" });
  }
};

// ---------------- USER: history ----------------
exports.history = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const items = await Prediction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(items);
  } catch (error) {
    console.error("history error:", error);
    return res.status(500).json({ message: "History fetch error" });
  }
};

// ---------------- ADMIN: all predictions ----------------
exports.adminGetAllPredictions = async (req, res) => {
  try {
    const q = toStr(req.query.q).toLowerCase();
    const riskLevel = toStr(req.query.riskLevel).toLowerCase();

    const filter = {};
    if (["low", "moderate", "high"].includes(riskLevel)) {
      filter.riskLevel = riskLevel;
    }

    let items = await Prediction.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(200);

    if (q) {
      items = items.filter((p) => {
        const hay = [
          p?.user?.name,
          p?.user?.email,
          p?.riskLevel,
          p?.prediction,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(q);
      });
    }

    return res.json(items);
  } catch (error) {
    console.error("adminGetAllPredictions error:", error);
    return res.status(500).json({ message: "Failed to load predictions" });
  }
};

// ---------------- ADMIN: predictions by user ----------------
exports.adminGetPredictionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const items = await Prediction.find({ user: userId })
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(items);
  } catch (error) {
    console.error("adminGetPredictionsByUser error:", error);
    return res.status(500).json({ message: "Failed to load user predictions" });
  }
};

// ---------------- ADMIN: delete a prediction ----------------
exports.adminDeletePrediction = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Prediction.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    return res.json({ message: "Prediction deleted" });
  } catch (error) {
    console.error("adminDeletePrediction error:", error);
    return res.status(500).json({ message: "Failed to delete prediction" });
  }
};