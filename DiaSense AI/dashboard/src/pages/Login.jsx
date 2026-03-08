import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ✅ Use env if available, fallback to localhost
const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Always land on /dashboard after successful admin login
  const redirectTo = useMemo(() => {
    const stateFrom = location.state?.from;
    return typeof stateFrom === "string" && stateFrom.startsWith("/")
      ? stateFrom
      : "/dashboard";
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ If token exists: allow ONLY if stored user is admin, else logout
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) return;

    try {
      const user = JSON.parse(userStr);
      if (!user || user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Access denied: Admins only.");
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError("Session invalid. Please login again.");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(email).trim().toLowerCase(),
          password: String(password),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Login failed");
      if (!data?.token) throw new Error("Token not received from server");
      if (!data?.user) throw new Error("User info not received from server");

      if (data.user.role !== "admin") {
        throw new Error("Access denied: Admins only.");
      }

      // ✅ Save token + user (only after admin check)
      // If you want "remember me" behavior, you can keep same storage (simple).
      // Optionally store a flag:
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("remember_admin", remember ? "1" : "0");

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(380px, 520px) 1fr",
        background: "#F6F8FC",
      }}
    >
      {/* LEFT: LOGIN CARD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "white",
            borderRadius: 18,
            padding: 26,
            border: "1px solid rgba(148,163,184,.25)",
            boxShadow: "0 10px 30px rgba(2,6,23,.06)",
          }}
        >
          {/* brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              D
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>DiaSense</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Admin Console</div>
            </div>
          </div>

          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#0f172a" }}>
            Welcome back
          </h1>
          <p style={{ marginTop: 6, marginBottom: 16, color: "#64748b" }}>
            Sign in to your admin account to continue
          </p>

          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.25)",
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              <b>Login failed:</b> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* email */}
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>
              Email
            </label>
            <div style={{ position: "relative", marginTop: 6 }}>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,.45)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            {/* password */}
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                Password
              </label>

              <div style={{ position: "relative", marginTop: 6 }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,.45)",
                    outline: "none",
                    fontSize: 14,
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#64748b",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                  aria-label="toggle password"
                  title="Show/Hide"
                >
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* options row */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <span style={{ fontSize: 13, color: "#64748b" }}>
                Admins only
              </span>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                color: "white",
                fontWeight: 900,
                fontSize: 14,
                boxShadow: "0 10px 18px rgba(37,99,235,.18)",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 16, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Not an admin? Use the main user website login.
            <br />
            Need an admin account?{" "}
            <Link to="/register" style={{ color: "#2563eb", fontWeight: 800, textDecoration: "none" }}>
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT: BRAND PANEL */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          padding: 24,
          background:
            "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(6,182,212,1) 100%)",
        }}
      >
        <div style={{ textAlign: "center", color: "white", maxWidth: 520 }}>
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: 999,
              background: "rgba(255,255,255,.18)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 18px",
              backdropFilter: "blur(6px)",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 900 }}>⌁</div>
          </div>

          <h2 style={{ margin: 0, fontSize: 40, fontWeight: 900 }}>DiaSense AI</h2>
          <p style={{ marginTop: 10, fontSize: 16, opacity: 0.92, lineHeight: 1.7 }}>
            Your personal AI-powered health companion for diabetes risk prediction and management.
          </p>

          <div
            style={{
              marginTop: 26,
              display: "inline-flex",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,.18)",
              border: "1px solid rgba(255,255,255,.25)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800 }}>Admin Panel</span>
            <span style={{ opacity: 0.85, fontSize: 13 }}>• Secure Access</span>
          </div>
        </div>
      </div>

      {/* responsive: stack on small screens */}
      <style>{`
        @media (max-width: 900px){
          div[style*="grid-template-columns"]{
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}