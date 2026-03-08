import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ClipboardPlus,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type User = {
  _id?: string;
  name?: string;
  email?: string;
};

type PredictionFactor = {
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

type PredictionItem = {
  _id?: string;
  createdAt?: string;
  prediction?: string;
  riskScore?: number;
  riskLevel?: string;
  factors?: PredictionFactor[];
  recommendations?: RecommendationGroup;
  inputData?: {
    glucose?: number;
    bmi?: number;
    bloodPressure?: number;
    age?: number;
  };
};

const Reports = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [meRes, predictionRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE}/predict/history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const meData = await meRes.json();
        const predictionData = await predictionRes.json();

        if (!meRes.ok) {
          throw new Error(meData?.message || "Failed to load user profile");
        }

        if (!predictionRes.ok) {
          throw new Error(
            predictionData?.message || "Failed to load prediction history"
          );
        }

        setUser(meData?.user || meData || null);

        if (Array.isArray(predictionData)) {
          setPredictions(predictionData);
        } else if (Array.isArray(predictionData?.history)) {
          setPredictions(predictionData.history);
        } else if (Array.isArray(predictionData?.predictions)) {
          setPredictions(predictionData.predictions);
        } else {
          setPredictions([]);
        }
      } catch (err: any) {
        setError(err?.message || "Something went wrong while loading reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, token]);

  const displayName = useMemo(() => {
    return user?.name?.trim() || "User";
  }, [user]);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  };

  const getRiskBadge = (riskLevel?: string) => {
    const level = (riskLevel || "").toLowerCase();

    if (level.includes("high")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (level.includes("moderate")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const normalizeRecommendations = (
    recommendations?: RecommendationGroup
  ): {
    diet: string[];
    activity: string[];
    lifestyle: string[];
    monitoring: string[];
  } => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Welcome back, {displayName}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Here are your past diabetes predictions and personalized
              recommendations.
            </p>
          </motion.div>

          {loading ? (
            <div className="bg-card rounded-3xl border border-border p-8 text-center">
              <p className="text-muted-foreground">Loading your reports...</p>
            </div>
          ) : error ? (
            <div className="bg-card rounded-3xl border border-destructive/20 p-8 text-center">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card rounded-3xl border border-border p-6 md:p-8"
            >
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Reports (Predictions)</h2>
                  <p className="text-muted-foreground mt-1">
                    Each report includes the matched recommendations returned for
                    that prediction.
                  </p>
                </div>

                <Button
                  variant="hero"
                  onClick={() => navigate("/predict")}
                  className="rounded-xl"
                >
                  New Prediction
                </Button>
              </div>

              {predictions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                  <p className="text-lg font-semibold mb-2">
                    No prediction reports found
                  </p>
                  <p className="text-muted-foreground mb-5">
                    Start a new diabetes risk assessment to generate your first
                    report.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/predict")}>
                    Go to Prediction
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {predictions.map((item, index) => {
                    const rec = normalizeRecommendations(item.recommendations);

                    return (
                      <div
                        key={item._id || index}
                        className="rounded-3xl border border-border bg-background p-5 md:p-6"
                      >
                        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold">
                                {item.prediction || "Prediction Result"}
                              </h3>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRiskBadge(
                                  item.riskLevel
                                )}`}
                              >
                                {item.riskLevel || "Low"}
                              </span>
                            </div>

                            <p className="text-muted-foreground">
                              Date: {formatDate(item.createdAt)} • Risk:{" "}
                              {typeof item.riskScore === "number"
                                ? `${item.riskScore.toFixed(2)}/100`
                                : "N/A"}{" "}
                              • Level: {item.riskLevel || "N/A"}
                            </p>

                            <p className="text-muted-foreground mt-2">
                              Glucose: {item.inputData?.glucose ?? "N/A"} • BMI:{" "}
                              {item.inputData?.bmi ?? "N/A"} • BP:{" "}
                              {item.inputData?.bloodPressure ?? "N/A"} • Age:{" "}
                              {item.inputData?.age ?? "N/A"}
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() =>
                              navigate("/result", {
                                state: {
                                  formData: item.inputData || {},
                                  result: item,
                                },
                              })
                            }
                            className="rounded-xl"
                          >
                            View Full Report
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        {Array.isArray(item.factors) && item.factors.length > 0 && (
                          <div className="mb-6 rounded-2xl bg-muted/40 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <ShieldCheck className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold">Key Factors</h4>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              {item.factors.slice(0, 4).map((factor, factorIndex) => (
                                <div
                                  key={factorIndex}
                                  className="rounded-xl border border-border bg-card p-3"
                                >
                                  <p className="font-semibold">
                                    {factor.label ||
                                      factor.name ||
                                      `Factor ${factorIndex + 1}`}
                                  </p>
                                  {factor.value !== undefined && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Value: {String(factor.value)}
                                    </p>
                                  )}
                                  {factor.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {factor.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <ClipboardPlus className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-semibold">
                              Personalized Recommendations
                            </h4>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-border p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <HeartPulse className="w-5 h-5 text-emerald-600" />
                                <h5 className="font-semibold">Diet</h5>
                              </div>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {(rec.diet.length
                                  ? rec.diet
                                  : ["Maintain balanced meals and reduce excess sugar intake."]).map(
                                  (text, i) => (
                                    <li key={i}>• {text}</li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div className="rounded-2xl border border-border p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <h5 className="font-semibold">Physical Activity</h5>
                              </div>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {(rec.activity.length
                                  ? rec.activity
                                  : ["Aim for regular walking and moderate exercise each week."]).map(
                                  (text, i) => (
                                    <li key={i}>• {text}</li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div className="rounded-2xl border border-border p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Stethoscope className="w-5 h-5 text-purple-600" />
                                <h5 className="font-semibold">Lifestyle</h5>
                              </div>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {(rec.lifestyle.length
                                  ? rec.lifestyle
                                  : ["Maintain good sleep, reduce stress, and follow healthy habits."]).map(
                                  (text, i) => (
                                    <li key={i}>• {text}</li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div className="rounded-2xl border border-border p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <ClipboardPlus className="w-5 h-5 text-amber-600" />
                                <h5 className="font-semibold">Monitoring</h5>
                              </div>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {(rec.monitoring.length
                                  ? rec.monitoring
                                  : ["Follow up with regular health checks and glucose monitoring."]).map(
                                  (text, i) => (
                                    <li key={i}>• {text}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl"
                >
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default Reports;