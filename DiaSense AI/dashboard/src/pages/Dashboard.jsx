import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [doctorStats, setDoctorStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [userCount, setUserCount] = useState(0);

  /* ------------------------------------------------------------------ */
  /* Logout Function */
  /* ------------------------------------------------------------------ */
  const logout = () => {
    // remove auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login page
    navigate("/login", { replace: true });
  };

  /* ------------------------------------------------------------------ */
  /* Back Button */
  /* ------------------------------------------------------------------ */
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/login", { replace: true });
    }
  };

  /* ------------------------------------------------------------------ */
  /* Load Dashboard Stats */
  /* ------------------------------------------------------------------ */
  const loadStats = async () => {
    try {
      setLoading(true);
      setErr("");

      // Doctor stats
      const docRes = await api.get("/doctors/admin/stats");
      const docs = Array.isArray(docRes.data) ? docRes.data : [];

      const total = docs.length;
      const active = docs.filter((d) => d.isActive !== false).length;
      const inactive = total - active;

      setDoctorStats({ total, active, inactive });

      // Users (optional)
      try {
        const usersRes = await api.get("/users");
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        setUserCount(users.length);
      } catch {
        setUserCount(0);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const cards = useMemo(() => {
    return [
      { title: "Total Doctors", value: doctorStats.total },
      { title: "Active Doctors", value: doctorStats.active },
      { title: "Inactive Doctors", value: doctorStats.inactive },
      { title: "Total Users", value: userCount },
    ];
  }, [doctorStats, userCount]);

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */
  return (
    <div className="adm-wrap">
      {/* TOPBAR */}
      <header className="adm-topbar">
        <div className="adm-brand">
          <div className="adm-logo">A</div>
          <div>
            <div className="adm-title">Admin Dashboard</div>
            <div className="adm-sub">
              Manage doctors, users, and bookings
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* <button
            className="adm-btn adm-btn-outline"
            type="button"
            onClick={goBack}
          >
            ← Back
          </button> */}

          {/* ✅ NEW LOGOUT BUTTON */}
          <button
            className="adm-btn"
            type="button"
            style={{ background: "crimson" }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="adm-main">
        {/* ERROR */}
        {err && (
          <div
            className="adm-footerbox"
            style={{
              marginBottom: 14,
              borderColor: "rgba(220,38,38,.35)",
              background: "rgba(254,242,242,.8)",
            }}
          >
            <b style={{ color: "crimson" }}>Error: </b>
            <span>{err}</span>
            <div style={{ marginTop: 10 }}>
              <button
                className="adm-btn adm-btn-outline"
                onClick={loadStats}
                disabled={loading}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="adm-footerbox" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 10 }}>Quick Actions</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <button
              className="adm-btn"
              style={{ padding: "14px 16px" }}
              onClick={() => navigate("/doctors")}
            >
              Doctor Management
            </button>

            <button
              className="adm-btn"
              style={{ padding: "14px 16px" }}
              onClick={() => navigate("/users")}
            >
              User Management
            </button>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {cards.map((c) => (
            <div key={c.title} className="adm-footerbox">
              <div className="adm-muted" style={{ fontSize: 12 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>
                {loading ? "—" : c.value}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}