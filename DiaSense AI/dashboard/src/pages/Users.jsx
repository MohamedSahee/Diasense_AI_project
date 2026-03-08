// diasense-ai-dashboard/src/pages/Users.jsx (FULL REPLACE)
// ✅ Fixes:
// 1) Refresh button big -> force small button sizing (inline + !important style tag)
// 2) Predictions tab details "-" -> show actual prediction fields (riskScore, riskLevel, glucose, bmi, age...)
// ✅ PERFECT Actions button alignment (2x2 grid)
// ✅ NO horizontal scroll (table becomes responsive card-list on small screens)

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Users() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("users"); // users | bookings | predictions
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

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

  /* -------------------------------------------------------------------------- */
  /*                                   USERS                                    */
  /* -------------------------------------------------------------------------- */

  const [users, setUsers] = useState([]);
  const [uq, setUq] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users (check /api/users route)");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 BOOKINGS                                   */
  /* -------------------------------------------------------------------------- */

  const [bookings, setBookings] = useState([]);
  const [bq, setBq] = useState("");
  const [bOnlyPending, setBOnlyPending] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/appointments/admin");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Failed to load bookings. Backend missing: GET /api/appointments/admin"
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

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
    if (!appointmentId) return;
    const yes = window.confirm("Delete this booking permanently?");
    if (!yes) return;

    try {
      setLoading(true);
      setBookings((prev) => prev.filter((b) => b._id !== appointmentId));
      await api.delete(`/appointments/admin/${appointmentId}`);
      setMsg("ok", "Booking deleted ✅");
      await loadBookings();
    } catch (e) {
      setMsg("err", e?.response?.data?.message || "Delete failed");
      await loadBookings();
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                PREDICTIONS                                 */
  /* -------------------------------------------------------------------------- */

  const [predictions, setPredictions] = useState([]);
  const [pq, setPq] = useState("");

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/predict/admin");
      setPredictions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Failed to load predictions. Backend missing: GET /api/predict/admin"
      );
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  LIFECYCLE                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "bookings") loadBookings();
    if (tab === "predictions") loadPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* -------------------------------------------------------------------------- */
  /*                                   FILTERS                                  */
  /* -------------------------------------------------------------------------- */

  const visibleUsers = useMemo(() => {
    const s = uq.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const hay = [u.name, u.email, u.role].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [users, uq]);

  const visibleBookings = useMemo(() => {
    const s = bq.trim().toLowerCase();
    let list = bookings;

    if (bOnlyPending) list = list.filter((b) => String(b.status).toLowerCase() === "pending");
    if (!s) return list;

    return list.filter((b) => {
      const hay = [
        b?.user?.name,
        b?.user?.email,
        b?.doctor?.name,
        b?.doctorName,
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
  }, [bookings, bq, bOnlyPending]);

  const visiblePredictions = useMemo(() => {
    const s = pq.trim().toLowerCase();
    if (!s) return predictions;
    return predictions.filter((p) => {
      const hay = [
        p?.user?.name,
        p?.user?.email,
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

  const chip = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "confirmed")
      return "px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200";
    if (s === "cancelled")
      return "px-2 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200";
    return "px-2 py-1 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200";
  };

  const fmtDateOnly = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const fmtDateTime = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleString();
    } catch {
      return "-";
    }
  };

  // prevents wide cells from forcing horizontal scroll
  const ellipsisCell = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  };

  const wrapCell = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.25,
  };

  // unified button sizing (perfect alignment)
  const btnBase = {
    width: "100%",
    padding: "10px 0",
    borderRadius: 14,
    fontWeight: 800,
    lineHeight: 1,
  };

  // ✅ SMALL topbar / tabs / refresh buttons
  const smallBtn = {
    padding: "6px 10px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1.1,
    height: "auto",
  };

  const predictionDetailsText = (p) => {
    const parts = [
      p?.riskScore != null ? `Risk: ${Math.round(p.riskScore)}%` : null,
      p?.riskLevel ? `Level: ${p.riskLevel}` : null,
      p?.glucose != null ? `Glucose: ${p.glucose}` : null,
      p?.bloodPressure != null ? `BP: ${p.bloodPressure}` : null,
      p?.bmi != null ? `BMI: ${p.bmi}` : null,
      p?.age != null ? `Age: ${p.age}` : null,
    ].filter(Boolean);

    return parts.length ? parts.join(" | ") : "-";
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="adm-wrap">
      {/* TOPBAR */}
      <header className="adm-topbar">
        <div className="adm-brand">
          <div className="adm-logo">U</div>
          <div>
            <div className="adm-title">User Management</div>
            <div className="adm-sub">Users • Predictions • Doctor Bookings</div>
          </div>
        </div>

        <button
          className="adm-btn adm-btn-outline adm-btn-sm"
          style={smallBtn}
          type="button"
          onClick={() => navigate("/dashboard", { replace: true })}
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
            <b style={{ color: err ? "crimson" : "green" }}>{err ? "Error: " : "Success: "}</b>
            <span>{err || ok}</span>
          </div>
        )}

        {/* TABS */}
        <div className="adm-footerbox" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className={`adm-btn ${tab === "users" ? "" : "adm-btn-outline"}`}
              style={smallBtn}
              type="button"
              onClick={() => setTab("users")}
            >
              Users
            </button>

            <button
              className={`adm-btn ${tab === "bookings" ? "" : "adm-btn-outline"}`}
              style={smallBtn}
              type="button"
              onClick={() => setTab("bookings")}
            >
              Doctor Bookings
            </button>

            <button
              className={`adm-btn ${tab === "predictions" ? "" : "adm-btn-outline"}`}
              style={smallBtn}
              type="button"
              onClick={() => setTab("predictions")}
            >
              Predictions
            </button>

            <div style={{ marginLeft: "auto" }}>
              <button
                className="adm-btn adm-btn-outline adm-btn-sm"
                style={smallBtn}
                type="button"
                onClick={() => {
                  if (tab === "users") loadUsers();
                  if (tab === "bookings") loadBookings();
                  if (tab === "predictions") loadPredictions();
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* USERS TAB */}
        {tab === "users" && (
          <div className="adm-footerbox">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>All Users</h4>
                <div className="adm-muted" style={{ fontSize: 13 }}>
                  {visibleUsers.length} user(s) shown
                </div>
              </div>

              <input
                className="adm-input"
                style={{ width: 340, maxWidth: "100%" }}
                placeholder="Search name / email / role"
                value={uq}
                onChange={(e) => setUq(e.target.value)}
              />
            </div>

            <div className="adm-table-wrap" style={{ marginTop: 12 }}>
              <table className="adm-table" style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>Name</th>
                    <th style={{ width: "44%" }}>Email</th>
                    <th style={{ width: "12%" }}>Role</th>
                    <th style={{ width: "18%" }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ ...ellipsisCell }}>
                        <button
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          style={{ ...smallBtn, marginRight: 8 }}
                          type="button"
                          onClick={() => navigate(`/users/${u._id}`)}
                        >
                          View
                        </button>
                        {u.name || "-"}
                      </td>
                      <td style={ellipsisCell}>{u.email || "-"}</td>
                      <td style={ellipsisCell}>{u.role || "user"}</td>
                      <td style={ellipsisCell}>{fmtDateOnly(u.createdAt)}</td>
                    </tr>
                  ))}

                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="adm-muted" style={{ padding: 16 }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === "bookings" && (
          <div className="adm-footerbox">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>Doctor Bookings</h4>
                <div className="adm-muted" style={{ fontSize: 13 }}>
                  {visibleBookings.length} booking(s) shown
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  className="adm-input"
                  style={{ width: 420, maxWidth: "100%" }}
                  placeholder="Search patient / doctor / status / time"
                  value={bq}
                  onChange={(e) => setBq(e.target.value)}
                />

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={bOnlyPending}
                    onChange={(e) => setBOnlyPending(e.target.checked)}
                  />
                  Only Pending
                </label>
              </div>
            </div>

            <div className="adm-table-wrap" style={{ marginTop: 12 }}>
              <table className="adm-table hide-on-mobile" style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th style={{ width: "16%" }}>Patient</th>
                    <th style={{ width: "20%" }}>Email</th>
                    <th style={{ width: "14%" }}>Doctor</th>
                    <th style={{ width: "12%" }}>Date</th>
                    <th style={{ width: "10%" }}>Time</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "18%" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleBookings.map((b) => (
                    <tr key={b._id}>
                      <td style={ellipsisCell}>{b?.user?.name || "-"}</td>
                      <td style={ellipsisCell}>{b?.user?.email || "-"}</td>
                      <td style={{ ...ellipsisCell, fontWeight: 700 }}>
                        {b?.doctor?.name || b?.doctorName || "-"}
                      </td>
                      <td style={wrapCell}>{fmtDateOnly(b.appointmentDate)}</td>
                      <td style={ellipsisCell}>{b.timeSlot || "-"}</td>
                      <td style={ellipsisCell}>
                        <span className={chip(b.status)}>{String(b.status || "pending")}</span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 8,
                          }}
                        >
                          <button
                            className="adm-btn"
                            style={btnBase}
                            onClick={() => changeBookingStatus(b._id, "confirmed")}
                            disabled={String(b.status).toLowerCase() === "confirmed" || loading}
                          >
                            Confirm
                          </button>

                          <button
                            className="adm-btn adm-btn-outline"
                            style={{ ...btnBase }}
                            onClick={() => changeBookingStatus(b._id, "pending")}
                            disabled={String(b.status).toLowerCase() === "pending" || loading}
                          >
                            Pending
                          </button>

                          <button
                            className="adm-btn adm-btn-outline"
                            style={{ ...btnBase, borderColor: "crimson", color: "crimson" }}
                            onClick={() => changeBookingStatus(b._id, "cancelled")}
                            disabled={String(b.status).toLowerCase() === "cancelled" || loading}
                          >
                            Cancel
                          </button>

                          <button
                            className="adm-btn adm-btn-outline"
                            style={{ ...btnBase, borderColor: "#111827", color: "#111827" }}
                            onClick={() => deleteBooking(b._id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleBookings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="adm-muted" style={{ padding: 16 }}>
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="show-on-mobile" style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {visibleBookings.map((b) => (
                  <div key={b._id} className="adm-footerbox" style={{ padding: 12 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>{b?.doctor?.name || b?.doctorName || "-"}</div>
                        <span className={chip(b.status)}>{String(b.status || "pending")}</span>
                      </div>

                      <div className="adm-muted" style={{ fontSize: 13 }}>
                        <div><b>Patient:</b> {b?.user?.name || "-"}</div>
                        <div><b>Email:</b> {b?.user?.email || "-"}</div>
                        <div><b>Date:</b> {fmtDateOnly(b.appointmentDate)}</div>
                        <div><b>Time:</b> {b.timeSlot || "-"}</div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        <button
                          className="adm-btn"
                          style={btnBase}
                          onClick={() => changeBookingStatus(b._id, "confirmed")}
                          disabled={String(b.status).toLowerCase() === "confirmed" || loading}
                        >
                          Confirm
                        </button>

                        <button
                          className="adm-btn adm-btn-outline"
                          style={btnBase}
                          onClick={() => changeBookingStatus(b._id, "pending")}
                          disabled={String(b.status).toLowerCase() === "pending" || loading}
                        >
                          Pending
                        </button>

                        <button
                          className="adm-btn adm-btn-outline"
                          style={{ ...btnBase, borderColor: "crimson", color: "crimson" }}
                          onClick={() => changeBookingStatus(b._id, "cancelled")}
                          disabled={String(b.status).toLowerCase() === "cancelled" || loading}
                        >
                          Cancel
                        </button>

                        <button
                          className="adm-btn adm-btn-outline"
                          style={{ ...btnBase, borderColor: "#111827", color: "#111827" }}
                          onClick={() => deleteBooking(b._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {visibleBookings.length === 0 && (
                  <div className="adm-muted" style={{ padding: 16 }}>
                    No bookings found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PREDICTIONS TAB */}
        {tab === "predictions" && (
          <div className="adm-footerbox">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>User Predictions</h4>
                <div className="adm-muted" style={{ fontSize: 13 }}>
                  {visiblePredictions.length} prediction(s) shown
                </div>
              </div>

              <input
                className="adm-input"
                style={{ width: 380, maxWidth: "100%" }}
                placeholder="Search user / result / date"
                value={pq}
                onChange={(e) => setPq(e.target.value)}
              />
            </div>

            <div className="adm-table-wrap" style={{ marginTop: 12 }}>
              <table className="adm-table" style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>User</th>
                    <th style={{ width: "22%" }}>Email</th>
                    <th style={{ width: "18%" }}>Result</th>
                    <th style={{ width: "26%" }}>Details</th>
                    <th style={{ width: "16%" }}>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {visiblePredictions.map((p) => (
                    <tr key={p._id}>
                      <td style={ellipsisCell}>{p?.user?.name || "-"}</td>
                      <td style={ellipsisCell}>{p?.user?.email || "-"}</td>
                      <td style={{ ...ellipsisCell, fontWeight: 800 }}>
                        {p?.prediction || (p?.riskLevel ? `Risk ${p.riskLevel}` : "-")}
                      </td>
                      <td className="adm-muted" style={{ fontSize: 12, lineHeight: 1.35, ...ellipsisCell }}>
                        {predictionDetailsText(p)}
                      </td>
                      <td style={ellipsisCell}>{fmtDateTime(p.createdAt)}</td>
                    </tr>
                  ))}

                  {visiblePredictions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="adm-muted" style={{ padding: 16 }}>
                        No predictions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ Responsive CSS (and force small buttons even if global CSS is strong) */}
        <style>{`
          .adm-btn-sm {
            padding: 6px 10px !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            border-radius: 10px !important;
            line-height: 1.1 !important;
            height: auto !important;
          }

          @media (max-width: 900px) {
            .hide-on-mobile { display: none !important; }
            .show-on-mobile { display: grid !important; }
          }
          @media (min-width: 901px) {
            .hide-on-mobile { display: table !important; }
            .show-on-mobile { display: none !important; }
          }
        `}</style>
      </main>
    </div>
  );
}