// diasense-ai-dashboard/src/pages/UserDetails.jsx (FULL REPLACE)
// ✅ Per-user admin page: details + that user's bookings + that user's predictions
// ✅ Fixes:
// - "Route not found" user details: expects GET /api/users/:id
// - user email/joined not showing: supports {user} wrapper OR direct object
// - prediction details not showing: maps real Prediction fields (riskScore, glucose, bmi, age...)
// - action buttons wrap properly
// - refresh button size smaller (without changing global CSS)
//
// REQUIRED BACKEND ROUTES (admin protected):
// 1) GET    /api/users/:id
// 2) GET    /api/appointments/admin?userId=:id   (optional; fallback supported)
// 3) PATCH  /api/appointments/admin/:id/status
// 4) DELETE /api/appointments/admin/:id
// 5) GET    /api/predict/admin/user/:userId
// 6) DELETE /api/predict/admin/:id

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function UserDetails() {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState("bookings"); // bookings | predictions

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [user, setUser] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [bq, setBq] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [pq, setPq] = useState("");

  const msgTimerRef = useRef(null);
  const setMsg = (type, msg) => {
    if (type === "ok") {
      setOk(msg);
      setErr("");
    } else {
      setErr(msg);
      setOk("");
    }
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => {
      setOk("");
      setErr("");
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    };
  }, []);

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleString();
    } catch {
      return "-";
    }
  };

  const chip = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "confirmed")
      return "px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200";
    if (s === "cancelled")
      return "px-2 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200";
    return "px-2 py-1 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200";
  };

  const normalizeUser = (data) => {
    // some backends respond: { user: {...} } and some respond directly {...}
    if (!data) return null;
    if (data.user && typeof data.user === "object") return data.user;
    return data;
  };

  /* ========================= LOADERS ========================= */

  const loadUser = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setErr("");

      // ✅ GET /api/users/:id
      const res = await api.get(`/users/${userId}`);
      setUser(normalizeUser(res.data));
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Failed to load user. Ensure backend route exists: GET /api/users/:id (admin)."
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setErr("");

      // ✅ Preferred: backend supports userId filter
      try {
        const res = await api.get(`/appointments/admin`, {
          params: { userId },
        });
        setBookings(Array.isArray(res.data) ? res.data : []);
        return;
      } catch {
        // fallback below
      }

      // ✅ Fallback: load all then filter client-side
      const resAll = await api.get(`/appointments/admin`);
      const all = Array.isArray(resAll.data) ? resAll.data : [];
      const filtered = all.filter(
        (a) => String(a?.user?._id || a?.user) === String(userId)
      );
      setBookings(filtered);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Failed to load bookings. Need GET /api/appointments/admin (admin)."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setErr("");

      // ✅ GET /api/predict/admin/user/:userId
      const res = await api.get(`/predict/admin/user/${userId}`);
      setPredictions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Failed to load predictions. Need GET /api/predict/admin/user/:userId."
      );
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (tab === "bookings") loadBookings();
    if (tab === "predictions") loadPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ========================= ACTIONS ========================= */

  const changeBookingStatus = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/admin/${appointmentId}/status`, { status });
      setMsg("ok", `Booking marked as ${status} ✅`);
      await loadBookings();
    } catch (e) {
      setMsg("err", e?.response?.data?.message || "Failed to update booking status");
    }
  };

  const deleteBooking = async (appointmentId) => {
    if (!window.confirm("Delete this appointment permanently?")) return;
    try {
      await api.delete(`/appointments/admin/${appointmentId}`);
      setMsg("ok", "Appointment deleted ✅");
      await loadBookings();
    } catch (e) {
      setMsg("err", e?.response?.data?.message || "Failed to delete appointment");
    }
  };

  const deletePrediction = async (predictionId) => {
    if (!window.confirm("Delete this prediction permanently?")) return;
    try {
      await api.delete(`/predict/admin/${predictionId}`);
      setMsg("ok", "Prediction deleted ✅");
      await loadPredictions();
    } catch (e) {
      setMsg("err", e?.response?.data?.message || "Failed to delete prediction");
    }
  };

  /* ========================= FILTERS ========================= */

  const visibleBookings = useMemo(() => {
    const s = bq.trim().toLowerCase();
    let list = bookings;

    if (onlyPending) {
      list = list.filter((b) => String(b.status || "").toLowerCase() === "pending");
    }
    if (!s) return list;

    return list.filter((b) => {
      const hay = [
        b?.doctor?.name,
        b?.doctorName,
        b?.doctor?.specialization,
        b?.specialization,
        b?.timeSlot,
        b?.status,
        b?.appointmentDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [bookings, bq, onlyPending]);

  const visiblePredictions = useMemo(() => {
    const s = pq.trim().toLowerCase();
    if (!s) return predictions;
    return predictions.filter((p) => {
      const hay = [
        p?.prediction,
        p?.riskLevel,
        p?.riskScore,
        p?.createdAt,
        p?.glucose,
        p?.bmi,
        p?.age,
      ]
        .filter((v) => v !== undefined && v !== null)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [predictions, pq]);

  /* ========================= UI HELPERS ========================= */

  const predictionResultLabel = (p) => {
    // backend usually stores p.prediction like "Diabetic Risk Low"
    if (p?.prediction) return String(p.prediction);
    // fallback
    if (p?.riskLevel) return `Risk ${p.riskLevel}`;
    if (p?.riskScore != null) return `Risk ${Math.round(p.riskScore)}%`;
    return "-";
  };

  const predictionDetailsText = (p) => {
    // ✅ shows real stored fields from Prediction model
    const parts = [
      p?.riskScore != null ? `Risk: ${Math.round(p.riskScore)}%` : null,
      p?.riskLevel ? `Level: ${p.riskLevel}` : null,
      p?.glucose != null ? `Glucose: ${p.glucose}` : null,
      p?.bloodPressure != null ? `BP: ${p.bloodPressure}` : null,
      p?.bmi != null ? `BMI: ${p.bmi}` : null,
      p?.age != null ? `Age: ${p.age}` : null,
    ].filter(Boolean);

    if (parts.length) return parts.join(" | ");

    // last fallback if your backend stored modelOutput
    if (p?.modelOutput) {
      try {
        const s = JSON.stringify(p.modelOutput);
        return s.length > 160 ? s.slice(0, 160) + "…" : s;
      } catch {
        return "-";
      }
    }
    return "-";
  };

  const smallBtnStyle = {
    padding: "6px 10px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
  };

  /* ========================= RENDER ========================= */

  return (
    <div className="adm-wrap">
      {/* TOPBAR */}
      <header className="adm-topbar">
        <div className="adm-brand">
          <div className="adm-logo">U</div>
          <div>
            <div className="adm-title">User Details</div>
            <div className="adm-sub">Manage this user’s bookings and predictions</div>
          </div>
        </div>

        <button
          className="adm-btn adm-btn-outline adm-btn-sm"
          style={smallBtnStyle}
          type="button"
          onClick={() => navigate("/users", { replace: true })}
        >
          Back
        </button>
      </header>

      <main className="adm-main">
        {/* MESSAGE */}
        {(err || ok) && (
          <div
            className="adm-footerbox"
            style={{
              marginBottom: 14,
              borderColor: err ? "rgba(220,38,38,.35)" : "rgba(34,197,94,.35)",
              background: err ? "rgba(254,242,242,.8)" : "rgba(240,253,244,.8)",
            }}
          >
            <b style={{ color: err ? "crimson" : "green" }}>
              {err ? "Error: " : "Success: "}
            </b>
            <span>{err || ok}</span>
          </div>
        )}

        {/* USER CARD */}
        <div className="adm-footerbox" style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h4 style={{ marginBottom: 6 }}>
                {user?.name || "User"}{" "}
                <span className="adm-muted" style={{ fontWeight: 500, fontSize: 12 }}>
                  ({user?.role || "user"})
                </span>
              </h4>

              <div className="adm-muted" style={{ fontSize: 13 }}>
                <div>
                  <b>Email:</b> {user?.email || "-"}
                </div>
                <div>
                  <b>Joined:</b> {fmtDate(user?.createdAt)}
                </div>
                <div>
                  <b>User ID:</b> {userId || "-"}
                </div>
              </div>
            </div>

            <button
              className="adm-btn adm-btn-outline adm-btn-sm"
              style={smallBtnStyle}
              type="button"
              onClick={() => {
                loadUser();
                if (tab === "bookings") loadBookings();
                if (tab === "predictions") loadPredictions();
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="adm-footerbox" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className={`adm-btn ${tab === "bookings" ? "" : "adm-btn-outline"}`}
              style={smallBtnStyle}
              type="button"
              onClick={() => setTab("bookings")}
            >
              Bookings
            </button>

            <button
              className={`adm-btn ${tab === "predictions" ? "" : "adm-btn-outline"}`}
              style={smallBtnStyle}
              type="button"
              onClick={() => setTab("predictions")}
            >
              Predictions
            </button>
          </div>
        </div>

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <div className="adm-footerbox">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>Doctor Bookings</h4>
                <div className="adm-muted" style={{ fontSize: 13 }}>
                  {visibleBookings.length} booking(s)
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  className="adm-input"
                  style={{ width: 320, maxWidth: "100%" }}
                  placeholder="Search doctor / status / time"
                  value={bq}
                  onChange={(e) => setBq(e.target.value)}
                />

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={onlyPending}
                    onChange={(e) => setOnlyPending(e.target.checked)}
                  />
                  Only Pending
                </label>
              </div>
            </div>

            <div className="adm-table-wrap" style={{ marginTop: 12, overflowX: "auto" }}>
              <table className="adm-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th style={{ width: 380 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 700 }}>
                        {b?.doctor?.name || b?.doctorName || "-"}
                      </td>
                      <td>{fmtDate(b.appointmentDate)}</td>
                      <td>{b.timeSlot || "-"}</td>
                      <td>
                        <span className={chip(b.status)}>{String(b.status || "pending")}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          <button
                            className="adm-btn"
                            style={smallBtnStyle}
                            onClick={() => changeBookingStatus(b._id, "confirmed")}
                            disabled={String(b.status).toLowerCase() === "confirmed"}
                          >
                            Confirm
                          </button>

                          <button
                            className="adm-btn adm-btn-outline"
                            style={smallBtnStyle}
                            onClick={() => changeBookingStatus(b._id, "pending")}
                            disabled={String(b.status).toLowerCase() === "pending"}
                          >
                            Pending
                          </button>

                          <button
                            className="adm-btn adm-btn-outline"
                            style={{ ...smallBtnStyle, borderColor: "crimson", color: "crimson" }}
                            onClick={() => changeBookingStatus(b._id, "cancelled")}
                            disabled={String(b.status).toLowerCase() === "cancelled"}
                          >
                            Cancel
                          </button>

                          <button
                            className="adm-btn adm-btn-outline"
                            style={{ ...smallBtnStyle, borderColor: "#7c3aed", color: "#7c3aed" }}
                            onClick={() => deleteBooking(b._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="adm-muted" style={{ padding: 16 }}>
                        No bookings found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PREDICTIONS */}
        {tab === "predictions" && (
          <div className="adm-footerbox">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>Predictions</h4>
                <div className="adm-muted" style={{ fontSize: 13 }}>
                  {visiblePredictions.length} prediction(s)
                </div>
              </div>

              <input
                className="adm-input"
                style={{ width: 320, maxWidth: "100%" }}
                placeholder="Search risk / date"
                value={pq}
                onChange={(e) => setPq(e.target.value)}
              />
            </div>

            <div className="adm-table-wrap" style={{ marginTop: 12, overflowX: "auto" }}>
              <table className="adm-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Result</th>
                    <th>Details</th>
                    <th>Date</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePredictions.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 800 }}>{predictionResultLabel(p)}</td>

                      <td className="adm-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>
                        {predictionDetailsText(p)}
                      </td>

                      <td>{fmtDate(p.createdAt)}</td>

                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="adm-btn adm-btn-outline"
                            style={{ ...smallBtnStyle, borderColor: "crimson", color: "crimson" }}
                            onClick={() => deletePrediction(p._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visiblePredictions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="adm-muted" style={{ padding: 16 }}>
                        No predictions found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}