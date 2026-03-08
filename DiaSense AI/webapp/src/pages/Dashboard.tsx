import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Sparkles,
  TrendingUp,
  UserRound,
  BellRing,
  Stethoscope,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
  inputData?: {
    glucose?: number;
    bmi?: number;
    bloodPressure?: number;
    age?: number;
  };
  recommendations?: RecommendationGroup;
  factors?: Array<{
    name?: string;
    label?: string;
    value?: string | number;
    impact?: string;
    description?: string;
  }>;
  model?: {
    probability?: number;
    label?: string;
  };
};

type AppointmentItem = {
  _id?: string;
  doctorName?: string;
  specialization?: string;
  appointmentDate?: string;
  timeSlot?: string;
  status?: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [meRes, predictionRes, appointmentRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/predict/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/appointments/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const meData = await meRes.json();
        const predictionData = await predictionRes.json();
        const appointmentData = await appointmentRes.json();

        if (!meRes.ok) throw new Error(meData?.message || "Failed to load user profile");
        if (!predictionRes.ok) {
          throw new Error(predictionData?.message || "Failed to load prediction history");
        }
        if (!appointmentRes.ok) {
          throw new Error(appointmentData?.message || "Failed to load appointments");
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

        if (Array.isArray(appointmentData)) {
          setAppointments(appointmentData);
        } else if (Array.isArray(appointmentData?.appointments)) {
          setAppointments(appointmentData.appointments);
        } else {
          setAppointments([]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate, token]);

  const displayName = useMemo(() => user?.name?.trim() || "User", [user]);

  const sortedPredictions = useMemo(() => {
    return [...predictions].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [predictions]);

  const latestPrediction = sortedPredictions[0];
  const recentPredictions = sortedPredictions.slice(0, 5);

  const upcomingAppointments = useMemo(() => {
    return [...appointments]
      .filter((item) => item.status !== "cancelled")
      .sort((a, b) => {
        const aTime = a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
        const bTime = b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
        return aTime - bTime;
      })
      .slice(0, 3);
  }, [appointments]);

  const chartData = useMemo(() => {
    return [...sortedPredictions]
      .reverse()
      .slice(-6)
      .map((item, index) => ({
        name: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : `P${index + 1}`,
        score: Number(item.riskScore || 0),
      }));
  }, [sortedPredictions]);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  };

  const formatDateTime = (date?: string, timeSlot?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const datePart = Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
    return timeSlot ? `${datePart} • ${timeSlot}` : datePart;
  };

  const getRiskMeta = (riskLevel?: string) => {
    const level = (riskLevel || "").toLowerCase();

    if (level.includes("high")) {
      return {
        card: "border-red-200 bg-red-50",
        soft: "bg-red-100 text-red-700",
        text: "text-red-600",
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      };
    }

    if (level.includes("moderate")) {
      return {
        card: "border-amber-200 bg-amber-50",
        soft: "bg-amber-100 text-amber-700",
        text: "text-amber-600",
        icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
      };
    }

    return {
      card: "border-emerald-200 bg-emerald-50",
      soft: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-600",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    };
  };

  const latestMeta = getRiskMeta(latestPrediction?.riskLevel);

  const stats = useMemo(() => {
    const totalPredictions = sortedPredictions.length;
    const latestScore = Number(latestPrediction?.riskScore || 0);
    const avgGlucose =
      sortedPredictions.length > 0
        ? sortedPredictions.reduce((sum, item) => sum + Number(item.inputData?.glucose || 0), 0) /
          sortedPredictions.length
        : 0;
    const avgBmi =
      sortedPredictions.length > 0
        ? sortedPredictions.reduce((sum, item) => sum + Number(item.inputData?.bmi || 0), 0) /
          sortedPredictions.length
        : 0;

    return {
      totalPredictions,
      latestScore,
      avgGlucose: avgGlucose ? avgGlucose.toFixed(1) : "0.0",
      avgBmi: avgBmi ? avgBmi.toFixed(1) : "0.0",
    };
  }, [sortedPredictions, latestPrediction]);

  const normalizedRecommendations = useMemo(() => {
    const rec = latestPrediction?.recommendations;
    if (!rec) return [] as string[];
    if (Array.isArray(rec)) return rec.slice(0, 4);

    return [
      ...(rec.diet || []),
      ...(rec.activity || []),
      ...(rec.lifestyle || []),
      ...(rec.monitoring || []),
    ].slice(0, 4);
  }, [latestPrediction]);

  const explanationFactors = useMemo(() => {
    return (latestPrediction?.factors || []).slice(0, 3);
  }, [latestPrediction]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {displayName}!</h1>
              <p className="text-lg text-muted-foreground">
                Here&apos;s your AI-powered health dashboard with live predictions and guidance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => navigate("/reports")}>
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
              <Button className="rounded-xl" variant="hero" onClick={() => navigate("/predict")}>
                New Prediction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {loading ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">Loading your professional dashboard...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-destructive/20 bg-card p-10 text-center">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <button
                  onClick={() => navigate("/reports")}
                  className="rounded-3xl border border-border bg-card p-5 text-left transition hover:shadow-soft"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold">View Reports</h3>
                  <p className="text-sm text-muted-foreground mt-1">Past predictions and report downloads</p>
                </button>

                <button
                  onClick={() => navigate("/appointments")}
                  className="rounded-3xl border border-border bg-card p-5 text-left transition hover:shadow-soft"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Appointments</h3>
                  <p className="text-sm text-muted-foreground mt-1">Manage doctor bookings</p>
                </button>

                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                    <HeartPulse className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Average Glucose</h3>
                  <p className="mt-2 text-3xl font-bold">{stats.avgGlucose}</p>
                  <p className="text-sm text-muted-foreground">mg/dL from recorded predictions</p>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                    <ClipboardList className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Total Predictions</h3>
                  <p className="mt-2 text-3xl font-bold">{stats.totalPredictions}</p>
                  <p className="text-sm text-muted-foreground">AI assessments completed</p>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Health Overview</h2>
                        <p className="text-sm text-muted-foreground mt-1">Real-time summary from your latest prediction</p>
                      </div>
                      {latestPrediction && (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${latestMeta.soft}`}>
                          {latestPrediction.riskLevel || "Low Risk"}
                        </span>
                      )}
                    </div>

                    {latestPrediction ? (
                      <div className={`rounded-3xl border p-5 ${latestMeta.card}`}>
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 rounded-2xl bg-white/70 p-3">{latestMeta.icon}</div>
                            <div>
                              <p className="text-sm text-muted-foreground">Latest Prediction</p>
                              <h3 className={`mt-1 text-4xl font-bold capitalize ${latestMeta.text}`}>
                                {latestPrediction.riskLevel || "low"}
                              </h3>
                              <p className="mt-1 text-lg text-slate-700">
                                Score: {typeof latestPrediction.riskScore === "number" ? latestPrediction.riskScore.toFixed(2) : "N/A"}/100
                              </p>
                              <p className="mt-3 text-sm text-slate-600">
                                Glucose: {latestPrediction.inputData?.glucose ?? "N/A"} • BMI: {latestPrediction.inputData?.bmi ?? "N/A"} • BP: {latestPrediction.inputData?.bloodPressure ?? "N/A"} • Age: {latestPrediction.inputData?.age ?? "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="text-left md:text-right">
                            <p className="text-sm text-muted-foreground">{formatDate(latestPrediction.createdAt)}</p>
                            <button
                              onClick={() =>
                                navigate("/result", {
                                  state: {
                                    formData: latestPrediction.inputData || {},
                                    result: latestPrediction,
                                  },
                                })
                              }
                              className="mt-2 text-sm font-medium text-primary hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                        <p className="text-lg font-semibold mb-2">No predictions yet</p>
                        <p className="text-muted-foreground mb-4">Start a new diabetes risk assessment to unlock your dashboard insights.</p>
                        <Button onClick={() => navigate("/predict")}>Create First Prediction</Button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-border bg-card p-6">
                      <div className="mb-5 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Risk Trend</h2>
                      </div>

                      {chartData.length > 0 ? (
                        <div className="h-[260px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                              <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
                              <Tooltip />
                              <Area type="monotone" dataKey="score" stroke="#2563eb" fill="url(#riskGradient)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-muted/40 p-6 text-center text-muted-foreground">
                          Not enough prediction history to show a trend chart.
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-6">
                      <div className="mb-5 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">AI Recommendations</h2>
                      </div>

                      <div className="space-y-3">
                        {(normalizedRecommendations.length > 0
                          ? normalizedRecommendations
                          : [
                              "Maintain balanced meals and reduce excess sugar intake.",
                              "Aim for regular walking and moderate exercise.",
                              "Schedule periodic glucose and blood pressure checks.",
                            ]
                        ).map((tip, index) => (
                          <div key={index} className="flex gap-3 rounded-2xl bg-muted/40 p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <p className="text-sm leading-6 text-slate-700">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold">Explainable AI Factors</h2>
                    </div>

                    {explanationFactors.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        {explanationFactors.map((factor, index) => (
                          <div key={index} className="rounded-2xl border border-border bg-muted/30 p-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {factor.label || factor.name || `Factor ${index + 1}`}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-primary">{factor.value ?? "—"}</p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {factor.impact || "Contributing factor"}
                            </p>
                            {factor.description ? (
                              <p className="mt-2 text-sm leading-6 text-slate-600">{factor.description}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-muted/40 p-6 text-center text-muted-foreground">
                        Factor-level explanation will appear when available from the prediction service.
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold">Recent Predictions</h2>
                      <Button variant="ghost" className="rounded-xl" onClick={() => navigate("/reports")}>
                        View Reports
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {recentPredictions.length > 0 ? (
                      <div className="space-y-3">
                        {recentPredictions.map((item, index) => {
                          const meta = getRiskMeta(item.riskLevel);
                          return (
                            <div key={item._id || index} className="flex items-start justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">{meta.icon}</div>
                                <div>
                                  <p className="text-lg font-semibold capitalize">{item.riskLevel || item.prediction || "Prediction"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Score: {typeof item.riskScore === "number" ? item.riskScore.toFixed(2) : "N/A"}/100
                                  </p>
                                </div>
                              </div>
                              <p className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                        No recent predictions available.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Health Score</h2>
                      <HeartPulse className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="relative flex h-44 w-44 items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(#2563eb ${stats.latestScore * 3.6}deg, #e5e7eb 0deg)`,
                          }}
                        />
                        <div className="absolute inset-[14px] rounded-full bg-white" />
                        <div className="relative text-center">
                          <p className="text-4xl font-bold text-slate-900">{Math.round(stats.latestScore)}%</p>
                          <p className="text-sm text-muted-foreground mt-1">Current health score</p>
                        </div>
                      </div>

                      <span className={`mt-5 rounded-full px-4 py-2 text-sm font-semibold ${latestMeta.soft}`}>
                        {latestPrediction?.riskLevel || "No Risk Data"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingAppointments.map((item, index) => (
                          <div key={item._id || index} className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-xl font-semibold">{item.doctorName || "Doctor"}</p>
                            <p className="text-sm text-muted-foreground">{item.specialization || "Specialist"}</p>
                            <p className="mt-3 text-sm font-medium text-slate-700">{formatDateTime(item.appointmentDate, item.timeSlot)}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Status: {item.status || "pending"}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                        <p className="text-muted-foreground mb-4">No upcoming appointments.</p>
                        <Button variant="outline" onClick={() => navigate("/doctors")}>Find Doctors</Button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold">Daily Health Tips</h2>
                    </div>

                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Activity className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Stay hydrated and aim for 8 glasses of water daily.</span>
                      </li>
                      <li className="flex gap-2">
                        <Activity className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Take a 30-minute walk after meals to support glucose control.</span>
                      </li>
                      <li className="flex gap-2">
                        <Activity className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Monitor sugar intake in beverages and choose lower-sugar options.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <UserRound className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold">Quick Summary</h2>
                    </div>

                    <div className="space-y-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                        <span>Latest Score</span>
                        <span className="font-semibold">{stats.latestScore.toFixed(2)}/100</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                        <span>Average BMI</span>
                        <span className="font-semibold">{stats.avgBmi}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                        <span>Next Appointment</span>
                        <span className="font-semibold">{upcomingAppointments[0] ? formatDate(upcomingAppointments[0].appointmentDate) : "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default Dashboard;
