import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardPlus,
  Download,
  HeartPulse,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";

type Factor = {
  name?: string;
  label?: string;
  value?: string | number;
  impact?: string;
  description?: string;
};

type RecommendationGroup =
  | string[]
  | {
      diet?: string[];
      activity?: string[];
      lifestyle?: string[];
      monitoring?: string[];
    };

type ResultState = {
  formData?: Record<string, any>;
  result?: {
    _id?: string;
    message?: string;
    prediction?: string;
    riskScore?: number;
    riskLevel?: string;
    factors?: Factor[];
    recommendations?: RecommendationGroup;

    gender?: string;
    age?: number;
    glucose?: number;
    bloodPressure?: number;
    bmi?: number;
    insulin?: number;
    skinThickness?: number;
    pregnancies?: number;
    diabetesPedigree?: number;
    symptoms?: string;

    inputData?: Record<string, any>;

    model?: {
      probability?: number;
      label?: string;
    };

    modelOutput?: {
      probability?: number;
      label?: string;
    };
  };
};

const formatDateTime = () => {
  const now = new Date();
  return now.toLocaleString();
};

const formatRiskLevel = (riskLevel?: string) => {
  const level = (riskLevel || "").toLowerCase();

  if (level === "high") return "High Risk";
  if (level === "moderate") return "Moderate Risk";
  if (level === "low") return "Low Risk";

  if (level.includes("high")) return "High Risk";
  if (level.includes("moderate")) return "Moderate Risk";
  return "Low Risk";
};

const getRiskStyles = (riskLevel?: string) => {
  const level = (riskLevel || "").toLowerCase();

  if (level.includes("high")) {
    return {
      iconBg: "bg-red-100",
      icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
      heading: "text-red-700",
    };
  }

  if (level.includes("moderate")) {
    return {
      iconBg: "bg-amber-100",
      icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      heading: "text-amber-700",
    };
  }

  return {
    iconBg: "bg-emerald-100",
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
    heading: "text-emerald-700",
  };
};

const normalizeRecommendations = (recommendations?: RecommendationGroup) => {
  if (!recommendations) {
    return {
      diet: [],
      activity: [],
      lifestyle: [],
      monitoring: [],
    };
  }

  if (Array.isArray(recommendations)) {
    return {
      diet: recommendations,
      activity: [],
      lifestyle: [],
      monitoring: [],
    };
  }

  return {
    diet: recommendations.diet || [],
    activity: recommendations.activity || [],
    lifestyle: recommendations.lifestyle || [],
    monitoring: recommendations.monitoring || [],
  };
};

const PredictionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state || {}) as ResultState;
  const rawFormData = state.formData || {};
  const result = state.result || {};

  const mergedFormData = {
    ...result.inputData,
    ...rawFormData,
    gender:
      rawFormData.gender ??
      result.gender ??
      result.inputData?.gender ??
      "N/A",
    age: rawFormData.age ?? result.age ?? result.inputData?.age ?? "N/A",
    glucose:
      rawFormData.glucose ?? result.glucose ?? result.inputData?.glucose ?? "N/A",
    bloodPressure:
      rawFormData.bloodPressure ??
      result.bloodPressure ??
      result.inputData?.bloodPressure ??
      "N/A",
    bmi: rawFormData.bmi ?? result.bmi ?? result.inputData?.bmi ?? "N/A",
    insulin:
      rawFormData.insulin ?? result.insulin ?? result.inputData?.insulin ?? "N/A",
    skinThickness:
      rawFormData.skinThickness ??
      result.skinThickness ??
      result.inputData?.skinThickness ??
      "N/A",
    pregnancies:
      rawFormData.pregnancies ??
      result.pregnancies ??
      result.inputData?.pregnancies ??
      "N/A",
    diabetesPedigree:
      rawFormData.diabetesPedigree ??
      result.diabetesPedigree ??
      result.inputData?.diabetesPedigree ??
      "N/A",
    symptoms:
      rawFormData.symptoms ??
      result.symptoms ??
      result.inputData?.symptoms ??
      "",
  };

  const riskScore =
    typeof result.riskScore === "number" && Number.isFinite(result.riskScore)
      ? result.riskScore
      : 0;

  const riskLevel = result.riskLevel || "low";
  const displayRiskLevel = formatRiskLevel(riskLevel);

  const prediction =
    result.prediction ||
    result.model?.label ||
    result.modelOutput?.label ||
    "Prediction Complete";

  const probability =
    typeof result.model?.probability === "number"
      ? result.model.probability
      : typeof result.modelOutput?.probability === "number"
      ? result.modelOutput.probability
      : null;

  const factors = Array.isArray(result.factors) ? result.factors : [];
  const recommendations = useMemo(
    () => normalizeRecommendations(result.recommendations),
    [result.recommendations]
  );

  const riskStyles = getRiskStyles(displayRiskLevel);

  const patientSummary = [
    { label: "Gender", value: mergedFormData.gender },
    { label: "Age", value: mergedFormData.age },
    { label: "Glucose", value: mergedFormData.glucose },
    { label: "Blood Pressure", value: mergedFormData.bloodPressure },
    { label: "BMI", value: mergedFormData.bmi },
    { label: "Insulin", value: mergedFormData.insulin },
    { label: "Skin Thickness", value: mergedFormData.skinThickness },
    { label: "Pregnancies", value: mergedFormData.pregnancies },
    {
      label: "Diabetes Pedigree",
      value: mergedFormData.diabetesPedigree,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="pt-24 pb-16 print:pt-0 print:pb-0">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="no-print mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Prediction Result
              </h1>
              <p className="mt-2 text-slate-600">
                Review the medical summary below or download a clean printable
                report.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>

              <Button
                onClick={() => navigate("/book-doctor")}
                className="rounded-xl"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Doctor Consultation
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/predict")}
                className="rounded-xl"
              >
                New Prediction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="print-report mx-auto overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] print:rounded-none print:border-0 print:shadow-none"
          >
            <div className="report-section border-b border-slate-200 bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-8 text-white print:bg-none print:text-slate-900">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur print:bg-slate-100 print:text-slate-700">
                    <Activity className="h-4 w-4" />
                    DiaSense AI Medical Report
                  </div>
                  <h2 className="text-3xl font-bold">
                    Diabetes Risk Assessment Report
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-white/90 print:text-slate-600">
                    AI-assisted diabetes risk prediction summary generated from
                    submitted health metrics.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm backdrop-blur print:bg-slate-50">
                  <p>
                    <span className="font-semibold">Generated:</span>{" "}
                    {formatDateTime()}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">Report Type:</span> Clinical
                    Summary
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">System:</span> DiaSense AI
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 print:px-0 print:py-0">
              <section className="report-section break-inside-avoid mb-6 grid gap-6 print:block lg:grid-cols-[1.1fr_0.9fr]">
                <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${riskStyles.iconBg}`}
                    >
                      {riskStyles.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Assessment Outcome
                      </p>
                      <h3 className={`text-3xl font-bold ${riskStyles.heading}`}>
                        {displayRiskLevel}
                      </h3>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm print:shadow-none">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Risk Score
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {riskScore.toFixed(2)}%
                      </p>
                      <p className="text-sm text-slate-500">Risk Score</p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm print:shadow-none">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Prediction
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {prediction}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm print:shadow-none">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Model Probability
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {typeof probability === "number"
                          ? `${(probability * 100).toFixed(2)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-white p-6 print:mt-6 lg:print:mt-0">
                  <div className="mb-4 flex items-center gap-2">
                    <ClipboardPlus className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Patient Input Summary
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {patientSummary.map((item) => (
                      <div
                        key={item.label}
                        className="break-inside-avoid rounded-xl bg-slate-50 p-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {String(item.value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {mergedFormData.symptoms ? (
                    <div className="break-inside-avoid mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Symptoms
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {mergedFormData.symptoms}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="report-section break-inside-avoid mb-6 rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900">
                  Clinical Interpretation
                </h3>
                <p className="leading-7 text-slate-700">
                  This AI-assisted assessment indicates a{" "}
                  <span className="font-semibold">{displayRiskLevel}</span>{" "}
                  profile based on the submitted health metrics. The result
                  should be used as a preliminary screening aid only. Final
                  diagnosis and treatment planning must be performed by a
                  qualified healthcare professional.
                </p>
              </section>

              <section className="report-section break-inside-avoid mb-6 rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="mb-5 text-xl font-semibold text-slate-900">
                  Key Contributing Factors
                </h3>

                {factors.length > 0 ? (
                  <div className="grid gap-4">
                    {factors.map((factor, index) => (
                      <div
                        key={`${factor.name || factor.label || "factor"}-${index}`}
                        className="break-inside-avoid rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="pr-4">
                            <h4 className="text-lg font-semibold text-slate-900">
                              {factor.label ||
                                factor.name ||
                                `Factor ${index + 1}`}
                            </h4>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {factor.description ||
                                "Contributed to the risk assessment."}
                            </p>
                          </div>

                          <div className="md:min-w-[140px] md:text-right">
                            <p className="text-lg font-bold text-slate-900">
                              {factor.value ?? "—"}
                            </p>
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {factor.impact || "Impact noted"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                    No detailed factor breakdown was returned by the prediction
                    service.
                  </div>
                )}
              </section>

              <section className="report-section break-inside-avoid mb-6 rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="mb-5 text-xl font-semibold text-slate-900">
                  Personalized Recommendations
                </h3>

                <div className="grid gap-4 print:grid-cols-1 md:grid-cols-2">
                  <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <HeartPulse className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Diet Recommendations
                      </h4>
                    </div>
                    <ul className="space-y-3 text-sm leading-6 text-slate-700">
                      {(recommendations.diet.length
                        ? recommendations.diet
                        : [
                            "Maintain a balanced, low-sugar diet and follow clinician advice.",
                          ]).map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 p-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Physical Activity
                      </h4>
                    </div>
                    <ul className="space-y-3 text-sm leading-6 text-slate-700">
                      {(recommendations.activity.length
                        ? recommendations.activity
                        : [
                            "Aim for regular walking and moderate exercise as medically appropriate.",
                          ]).map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-purple-50 p-3">
                        <Stethoscope className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Lifestyle Changes
                      </h4>
                    </div>
                    <ul className="space-y-3 text-sm leading-6 text-slate-700">
                      {(recommendations.lifestyle.length
                        ? recommendations.lifestyle
                        : [
                            "Improve sleep, reduce stress, and follow a sustainable healthy routine.",
                          ]).map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-amber-50 p-3">
                        <ClipboardPlus className="h-5 w-5 text-amber-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        Health Monitoring
                      </h4>
                    </div>
                    <ul className="space-y-3 text-sm leading-6 text-slate-700">
                      {(recommendations.monitoring.length
                        ? recommendations.monitoring
                        : [
                            "Schedule follow-up testing and consult a doctor for interpretation.",
                          ]).map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="report-section break-inside-avoid rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <h3 className="text-lg font-semibold text-amber-900">
                  Medical Disclaimer
                </h3>
                <p className="mt-2 text-sm leading-7 text-amber-800">
                  This is an AI-powered screening tool and should not replace
                  professional medical advice, diagnosis, or treatment. Please
                  consult a licensed healthcare provider for clinical
                  evaluation, confirmatory testing, and medical decisions.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="no-print">
        <Footer />
        <ChatBot />
      </div>
    </div>
  );
};

export default PredictionResult;