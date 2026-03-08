// diasense-ai-dashboard/src/pages/Doctors.jsx (FULL REPLACE)

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const emptyForm = {
  name: "",
  specialization: "",
  hospital: "",
  location: "",
  experience: "",
  fee: "",
  availableDays: "", // "Mon, Tue"
  availableTime: "", // UI single field (we store as availableTimeSlots[0])
  bio: "", // ✅ NEW: About section
  isActive: true,
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop";

export default function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // file upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // list controls
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  // bookings modal state
  const [openBookings, setOpenBookings] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const msgTimerRef = useRef(null);

  // resolve "/uploads/..." to full backend url
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

  const resolveImg = (img) => {
    if (!img) return FALLBACK_IMG;
    if (/^https?:\/\//i.test(img)) return img;
    return `${SERVER_BASE}${img.startsWith("/") ? img : `/${img}`}`;
  };

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

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/doctors/admin/stats");

      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.doctors)
        ? raw.doctors
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      setDoctors(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!String(form.name).trim()) return setMsg("err", "Doctor name is required");
    if (!String(form.specialization).trim())
      return setMsg("err", "Specialization is required");

    try {
      setLoading(true);
      setErr("");
      setOk("");

      const fd = new FormData();

      fd.append("name", String(form.name || "").trim());
      fd.append("specialization", String(form.specialization || "").trim());
      fd.append("hospital", String(form.hospital || "").trim());
      fd.append("location", String(form.location || "").trim());

      fd.append("bio", String(form.bio || "").trim()); // ✅ NEW

      fd.append("experience", String(form.experience !== "" ? Number(form.experience) || 0 : 0));
      fd.append("fee", String(form.fee !== "" ? Number(form.fee) || 0 : 0));
      fd.append("isActive", String(!!form.isActive));

      // arrays must be JSON because backend uses JSON.parse()
      const daysArr = String(form.availableDays || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      fd.append("availableDays", JSON.stringify(daysArr));

      // store availableTime into availableTimeSlots[0]
      const timeText = String(form.availableTime || "").trim();
      const timeSlotsArr = timeText ? [timeText] : [];
      fd.append("availableTimeSlots", JSON.stringify(timeSlotsArr));

      if (imageFile) fd.append("image", imageFile); // multer field "image"

      if (editingId) {
        await api.put(`/doctors/admin/${editingId}`, fd);
        setMsg("ok", "Doctor updated ✅");
      } else {
        await api.post(`/doctors/admin`, fd);
        setMsg("ok", "Doctor added ✅");
      }

      await loadDoctors();
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e2) {
      setMsg("err", e2?.response?.data?.message || "Save failed (admin only)");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc._id);

    const timeFromSlots =
      Array.isArray(doc.availableTimeSlots) && doc.availableTimeSlots.length > 0
        ? String(doc.availableTimeSlots[0] || "")
        : "";

    setForm({
      name: doc.name || "",
      specialization: doc.specialization || "",
      hospital: doc.hospital || "",
      location: doc.location || "",
      experience: doc.experience ?? "",
      fee: doc.fee ?? "",
      availableDays: Array.isArray(doc.availableDays) ? doc.availableDays.join(", ") : doc.availableDays || "",
      availableTime: timeFromSlots || "",
      bio: doc.bio || "", // ✅ NEW
      isActive: doc.isActive !== false,
    });

    setImageFile(null);
    setImagePreview("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const delDoctor = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      setLoading(true);
      await api.delete(`/doctors/admin/${id}`);
      setMsg("ok", "Doctor deleted ✅");
      await loadDoctors();
    } catch (e) {
      setMsg("err", e?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleDoctor = async (id) => {
    try {
      setLoading(true);

      setDoctors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isActive: !(d.isActive !== false) } : d))
      );

      const res = await api.patch(`/doctors/admin/${id}/toggle`);

      if (res?.data?._id || res?.data?.doctor?._id) {
        const updated = res.data._id ? res.data : res.data.doctor;
        setDoctors((prev) =>
          prev.map((d) => (d._id === updated._id ? { ...d, ...updated } : d))
        );
      } else {
        await loadDoctors();
      }

      setMsg("ok", "Doctor status updated ✅");
    } catch (e) {
      await loadDoctors();
      setMsg("err", e?.response?.data?.message || "Toggle failed");
    } finally {
      setLoading(false);
    }
  };

  const viewBookings = async (doctor) => {
    try {
      setErr("");
      setSelectedDoctor(doctor);
      setOpenBookings(true);
      setBookings([]);
      setBookingsLoading(true);

      const res = await api.get(`/appointments/admin/doctor/${doctor._id}`);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const changeBookingStatus = async (appointmentId, status) => {
    if (!selectedDoctor?._id) return;

    try {
      await api.patch(`/appointments/admin/${appointmentId}/status`, { status });
      const res = await api.get(`/appointments/admin/doctor/${selectedDoctor._id}`);
      setBookings(Array.isArray(res.data) ? res.data : []);
      await loadDoctors();
      setMsg("ok", "Booking status updated ✅");
    } catch (e) {
      setMsg("err", e?.response?.data?.message || "Failed to update status");
    }
  };

  const closeBookings = () => {
    setOpenBookings(false);
    setSelectedDoctor(null);
    setBookings([]);
  };

  const stats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter((d) => d.isActive !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [doctors]);

  const visibleDoctors = useMemo(() => {
    const search = q.trim().toLowerCase();
    let list = doctors;

    if (onlyActive) list = list.filter((d) => d.isActive !== false);
    if (!search) return list;

    return list.filter((d) => {
      const hay = [d.name, d.specialization, d.hospital, d.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });
  }, [doctors, q, onlyActive]);

  const badgeClass = (active) =>
    active
      ? "px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
      : "px-2 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200";

  const chip = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "confirmed")
      return "px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200";
    if (s === "cancelled")
      return "px-2 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200";
    return "px-2 py-1 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200";
  };

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="adm-wrap">
      <header className="adm-topbar">
        <div className="adm-brand">
          <div className="adm-logo">D</div>
          <div>
            <div className="adm-title">Doctor Management</div>
            <div className="adm-sub">Add / Edit / Delete / Enable / View Bookings</div>
          </div>
        </div>

        <button
          className="adm-btn adm-btn-outline"
          type="button"
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          Back
        </button>
      </header>

      <main className="adm-main">
        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div className="adm-footerbox">
            <div className="adm-muted" style={{ fontSize: 12 }}>
              Total Doctors
            </div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.total}</div>
          </div>
          <div className="adm-footerbox">
            <div className="adm-muted" style={{ fontSize: 12 }}>
              Active
            </div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.active}</div>
          </div>
          <div className="adm-footerbox">
            <div className="adm-muted" style={{ fontSize: 12 }}>
              Inactive
            </div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.inactive}</div>
          </div>
        </div>

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

        {/* FORM */}
        <div className="adm-footerbox" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h4 style={{ marginBottom: 4 }}>{editingId ? "Edit Doctor" : "Add Doctor"}</h4>
              <p className="adm-muted" style={{ margin: 0 }}>
                Required: Name + Specialization. Upload image file to show doctor photo.
              </p>
            </div>

            {editingId && (
              <button className="adm-btn adm-btn-outline" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={submit} style={{ marginTop: 14 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <input
                className="adm-input"
                placeholder="Name *"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
              />
              <input
                className="adm-input"
                placeholder="Specialization *"
                value={form.specialization}
                onChange={(e) => onChange("specialization", e.target.value)}
                required
              />
              <input
                className="adm-input"
                placeholder="Hospital"
                value={form.hospital}
                onChange={(e) => onChange("hospital", e.target.value)}
              />

              <input
                className="adm-input"
                placeholder="Location"
                value={form.location}
                onChange={(e) => onChange("location", e.target.value)}
              />
              <input
                className="adm-input"
                placeholder="Experience (years)"
                type="number"
                value={form.experience}
                onChange={(e) => onChange("experience", e.target.value)}
              />
              <input
                className="adm-input"
                placeholder="Fee"
                type="number"
                value={form.fee}
                onChange={(e) => onChange("fee", e.target.value)}
              />

              <input
                className="adm-input"
                placeholder="Available Days (Mon, Tue...)"
                value={form.availableDays}
                onChange={(e) => onChange("availableDays", e.target.value)}
              />
              <input
                className="adm-input"
                placeholder="Available Time (10AM - 2PM)"
                value={form.availableTime}
                onChange={(e) => onChange("availableTime", e.target.value)}
              />

              <input
                className="adm-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
            </div>

            {/* ✅ ABOUT / BIO */}
            <div style={{ marginTop: 10 }}>
              <textarea
                className="adm-input"
                style={{ width: "100%", minHeight: 90, resize: "vertical" }}
                placeholder="About doctor (bio)"
                value={form.bio}
                onChange={(e) => onChange("bio", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={Boolean(form.isActive)}
                  onChange={(e) => onChange("isActive", e.target.checked)}
                />
                Active
              </label>

              <button className="adm-btn" disabled={loading} type="submit">
                {loading ? "Saving..." : editingId ? "Update Doctor" : "Add Doctor"}
              </button>
            </div>

            {/* PREVIEW */}
            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="new preview"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: "1px solid rgba(148,163,184,.5)",
                    }}
                  />
                  <div className="adm-muted" style={{ fontSize: 12 }}>
                    New image selected (uploads on save)
                  </div>
                </>
              ) : editingId ? (
                <>
                  <img
                    src={resolveImg(doctors.find((x) => x._id === editingId)?.image)}
                    alt="current"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: "1px solid rgba(148,163,184,.5)",
                    }}
                  />
                  <div className="adm-muted" style={{ fontSize: 12 }}>
                    Current saved image (choose new file to replace)
                  </div>
                </>
              ) : (
                <div className="adm-muted" style={{ fontSize: 12 }}>
                  No image selected (fallback image will show)
                </div>
              )}
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="adm-footerbox">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h4 style={{ marginBottom: 4 }}>Doctors</h4>
              <div className="adm-muted" style={{ fontSize: 13 }}>
                {visibleDoctors.length} doctor(s) shown
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input
                className="adm-input"
                style={{ width: 280 }}
                placeholder="Search name / specialization / hospital / location"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                />
                Only Active
              </label>

              <button className="adm-btn adm-btn-outline" onClick={loadDoctors} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          {loading && <p className="adm-muted" style={{ marginTop: 12 }}>Loading...</p>}

          <div className="adm-table-wrap" style={{ marginTop: 12 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Photo</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Hospital</th>
                  <th>Fee</th>
                  <th>Active</th>
                  <th style={{ width: 420 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleDoctors.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <img
                        src={resolveImg(d.image)}
                        alt="doctor"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          objectFit: "cover",
                          border: "1px solid rgba(148,163,184,.5)",
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 900 }}>{d.name}</td>
                    <td>{d.specialization || "-"}</td>
                    <td>{d.hospital || "-"}</td>
                    <td>{d.fee ?? "-"}</td>
                    <td>
                      <span className={badgeClass(d.isActive !== false)}>
                        {d.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="adm-btn" onClick={() => startEdit(d)}>
                        Edit
                      </button>

                      <button className="adm-btn adm-btn-outline" onClick={() => toggleDoctor(d._id)}>
                        Toggle
                      </button>

                      <button className="adm-btn adm-btn-outline" onClick={() => viewBookings(d)}>
                        View Bookings
                      </button>

                      <button
                        className="adm-btn adm-btn-outline"
                        style={{ borderColor: "crimson", color: "crimson" }}
                        onClick={() => delDoctor(d._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleDoctors.length === 0 && (
                  <tr>
                    <td colSpan="7" className="adm-muted" style={{ padding: 16 }}>
                      No doctors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="adm-muted" style={{ marginTop: 10, fontSize: 12 }}>
            Tip: Use “Toggle” to enable/disable doctor without deleting. Use “View Bookings” to manage
            appointment statuses.
          </div>
        </div>
      </main>

      {/* BOOKINGS MODAL */}
      {openBookings && (
        <div
          onClick={closeBookings}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="adm-footerbox"
            style={{
              width: "min(1100px, 98vw)",
              maxHeight: "85vh",
              overflow: "auto",
              borderRadius: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>Bookings — {selectedDoctor?.name || "Doctor"}</h4>
                <div className="adm-muted" style={{ fontSize: 13 }}>
                  Change status to Confirmed / Cancelled.
                </div>
              </div>

              <button className="adm-btn adm-btn-outline" onClick={closeBookings}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {bookingsLoading ? (
                <p className="adm-muted">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="adm-muted">No bookings found for this doctor.</p>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table" style={{ minWidth: 1000 }}>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th style={{ width: 360 }}>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id}>
                          <td style={{ fontWeight: 800 }}>{b?.user?.name || "-"}</td>
                          <td>{b?.user?.email || "-"}</td>
                          <td>{fmtDate(b.appointmentDate)}</td>
                          <td>{b.timeSlot || "-"}</td>
                          <td>
                            <span className={chip(b.status)}>{String(b.status || "pending")}</span>
                          </td>
                          <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              className="adm-btn"
                              onClick={() => changeBookingStatus(b._id, "confirmed")}
                              disabled={String(b.status).toLowerCase() === "confirmed"}
                            >
                              Confirm
                            </button>
                            <button
                              className="adm-btn adm-btn-outline"
                              onClick={() => changeBookingStatus(b._id, "pending")}
                              disabled={String(b.status).toLowerCase() === "pending"}
                            >
                              Set Pending
                            </button>
                            <button
                              className="adm-btn adm-btn-outline"
                              style={{ borderColor: "crimson", color: "crimson" }}
                              onClick={() => changeBookingStatus(b._id, "cancelled")}
                              disabled={String(b.status).toLowerCase() === "cancelled"}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="adm-muted" style={{ marginTop: 10, fontSize: 12 }}>
              Note: If bookings do not load, confirm backend route exists:
              <b> GET /api/appointments/admin/doctor/:doctorId</b> and token is admin.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}