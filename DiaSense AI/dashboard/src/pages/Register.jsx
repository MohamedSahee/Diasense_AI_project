import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ✅ Use env if available, fallback to localhost
const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

export default function Register() {
  const navigate = useNavigate();

  // form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // UI states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailNorm = useMemo(() => String(email || "").trim().toLowerCase(), [email]);

  const validate = () => {
    const n = String(name || "").trim();
    if (n.length < 2) return "Please enter your full name (min 2 characters).";

    if (!emailNorm) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) return "Please enter a valid email address.";

    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(name).trim(),
          email: emailNorm,
          password: String(password),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Registration failed");

      setSuccess("Account created successfully! Redirecting to admin login...");
      setName("");
      setEmail("");
      setPassword("");
      setConfirm("");

      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err?.message || "Registration failed");
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
      {/* LEFT: REGISTER CARD */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 440,
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
            Create admin account
          </h1>
          <p style={{ marginTop: 6, marginBottom: 16, color: "#64748b" }}>
            Register to access the admin dashboard
          </p>

          {success && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(34,197,94,.08)",
                border: "1px solid rgba(34,197,94,.25)",
                color: "#166534",
                fontSize: 13,
              }}
            >
              <b>Success:</b> {success}
            </div>
          )}

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
              <b>Error:</b> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>
              Full name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              style={{
                width: "100%",
                marginTop: 6,
                padding: "12px 12px",
                borderRadius: 14,
                border: "1px solid rgba(148,163,184,.45)",
                outline: "none",
                fontSize: 14,
              }}
            />

            {/* Email */}
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,.45)",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                Password
              </label>

              <div style={{ position: "relative", marginTop: 6 }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                >
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                Confirm password
              </label>

              <div style={{ position: "relative", marginTop: 6 }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
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
                  onClick={() => setShowConfirm((s) => !s)}
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
                >
                  {showConfirm ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 16,
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
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div style={{ marginTop: 16, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#2563eb", fontWeight: 800, textDecoration: "none" }}>
              Sign in
            </Link>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
            Your details are securely stored. Admin access required.
          </div>
        </div>
      </div>

      {/* RIGHT: BRAND PANEL */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(6,182,212,1) 100%)",
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
            Manage doctors, users and appointments with secure admin access.
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
            <span style={{ fontSize: 13, fontWeight: 800 }}>Admin Registration</span>
            <span style={{ opacity: 0.85, fontSize: 13 }}>• Secure Setup</span>
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