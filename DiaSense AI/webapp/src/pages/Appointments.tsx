import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Calendar,
  Clock,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  FileText,
} from "lucide-react";

type Appointment = {
  _id: string;
  doctorName?: string;
  specialization?: string;
  fee?: number;
  appointmentDate?: string;
  timeSlot?: string;
  status?: "pending" | "confirmed" | "cancelled";
  createdAt?: string;
};

function formatDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
}

const statusBadge = (status?: string) => {
  const s = String(status || "pending").toLowerCase();

  if (s === "confirmed") {
    return {
      icon: CheckCircle2,
      label: "Confirmed",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (s === "cancelled") {
    return {
      icon: XCircle,
      label: "Cancelled",
      cls: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    icon: AlertCircle,
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  };
};

const Appointments = () => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = new Date(a.appointmentDate || 0).getTime();
      const db = new Date(b.appointmentDate || 0).getTime();
      return db - da;
    });
  }, [items]);

  const upcoming = useMemo(() => {
    const now = new Date().getTime();
    return sorted.filter((x) => {
      const t = new Date(x.appointmentDate || 0).getTime();
      return t >= now && x.status !== "cancelled";
    });
  }, [sorted]);

  const past = useMemo(() => {
    const now = new Date().getTime();
    return sorted.filter((x) => {
      const t = new Date(x.appointmentDate || 0).getTime();
      return t < now || x.status === "cancelled";
    });
  }, [sorted]);

  const confirmedCount = useMemo(
    () => items.filter((x) => x.status === "confirmed").length,
    [items]
  );

  const pendingCount = useMemo(
    () => items.filter((x) => x.status === "pending").length,
    [items]
  );

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.myAppointments();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;

    try {
      await api.cancelAppointment(id);
      await load();
    } catch (e: any) {
      alert(e?.message || "Cancel failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="rounded-[32px] border border-border bg-white p-8 shadow-soft">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Calendar className="h-4 w-4" />
                    My Appointment Center
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Appointments
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    View your upcoming doctor visits, track appointment status,
                    and manage your consultation schedule from one place.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/doctors">
                    <Button className="rounded-xl">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Book Doctor
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={load}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>

                  <Link to="/dashboard">
                    <Button variant="ghost" className="rounded-xl">
                      Back to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {!loading && !err && (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {upcoming.length}
                </h3>
                <p className="mt-1 text-sm text-blue-600">
                  Scheduled appointments
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {confirmedCount}
                </h3>
                <p className="mt-1 text-sm text-emerald-600">
                  Ready for consultation
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Pending</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {pendingCount}
                </h3>
                <p className="mt-1 text-sm text-amber-600">
                  Awaiting confirmation
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-3xl border border-border bg-white p-8 text-muted-foreground shadow-soft">
              Loading appointments...
            </div>
          )}

          {!loading && err && (
            <div className="rounded-3xl border border-border bg-white p-8 shadow-soft">
              <p className="mb-1 font-medium text-destructive">Error</p>
              <p className="text-muted-foreground">{err}</p>
              <p className="mt-3 text-muted-foreground">
                Make sure you are logged in and the token exists in localStorage.
              </p>
              <Button className="mt-4 rounded-xl" onClick={load}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !err && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center shadow-soft">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xl font-semibold text-slate-900">
                No appointments yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by booking your first doctor consultation.
              </p>
              <Link to="/doctors">
                <Button className="mt-5 rounded-xl">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Book your first appointment
                </Button>
              </Link>
            </div>
          )}

          {!loading && !err && items.length > 0 && (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              {/* Upcoming */}
              <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Upcoming Appointments
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your scheduled and active consultations
                    </p>
                  </div>

                  <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    {upcoming.length} upcoming
                  </div>
                </div>

                {upcoming.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-slate-50 p-10 text-center">
                    <p className="text-lg font-semibold text-slate-900">
                      No upcoming appointments
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You currently do not have any scheduled consultations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map((a) => {
                      const b = statusBadge(a.status);
                      const Icon = b.icon;

                      return (
                        <motion.div
                          key={a._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl border border-border bg-white p-5 shadow-soft transition hover:shadow-medium"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900">
                                {a.doctorName || "Doctor"}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {a.specialization || "General Consultation"}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  {formatDate(a.appointmentDate)}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {a.timeSlot || "—"}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  Fee: Rs. {a.fee ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-3 lg:items-end">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${b.cls}`}
                              >
                                <Icon className="h-4 w-4" />
                                {b.label}
                              </span>

                              {a.status !== "cancelled" && (
                                <Button
                                  variant="outline"
                                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => cancel(a._id)}
                                >
                                  Cancel Appointment
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Past / Cancelled */}
              <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Past / Cancelled
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Completed or cancelled consultations
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700">
                    {past.length} records
                  </div>
                </div>

                {past.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-slate-50 p-10 text-center">
                    <p className="text-lg font-semibold text-slate-900">
                      No past appointments
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your completed or cancelled appointments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {past.map((a) => {
                      const b = statusBadge(a.status);
                      const Icon = b.icon;

                      return (
                        <motion.div
                          key={a._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl border border-border bg-white p-5 shadow-soft transition hover:shadow-medium"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900">
                                {a.doctorName || "Doctor"}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {a.specialization || "General Consultation"}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  {formatDate(a.appointmentDate)}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {a.timeSlot || "—"}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  Fee: Rs. {a.fee ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start lg:items-end">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${b.cls}`}
                              >
                                <Icon className="h-4 w-4" />
                                {b.label}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default Appointments;