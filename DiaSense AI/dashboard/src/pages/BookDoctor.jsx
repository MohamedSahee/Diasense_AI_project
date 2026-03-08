import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const BookDoctor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // doctor passed from Doctors.jsx: navigate("/book-doctor", { state: { doctor } })
  const doctor = location.state?.doctor;

  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Generate some default time slots (you can customize)
  const timeSlots = useMemo(
    () => [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ],
    []
  );

  // Minimum date = today (prevents booking past dates)
  const minDate = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validations
    if (!doctor?._id) {
      setError("No doctor selected. Please go back and choose a doctor.");
      return;
    }
    if (!token) {
      setError("Please login to book an appointment.");
      return;
    }
    if (!appointmentDate || !timeSlot) {
      setError("Please select both appointment date and time slot.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          appointmentDate,
          timeSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }

      setSuccess("Appointment booked successfully!");

      // Redirect after success (change route if your app uses different path)
      setTimeout(() => {
        navigate("/my-appointments");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  // If user refreshes page, location.state may be empty → handle gracefully
  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900">No Doctor Selected</h2>
          <p className="text-gray-600 mt-2">
            Please go back to the Doctors page and choose a doctor to book an
            appointment.
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Go to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-1">
            Select date and time slot to book an appointment.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Doctor Card */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{doctor.name}</h2>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="text-gray-500">Fee:</span>{" "}
                <span className="font-medium">{doctor.fee ?? "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Experience:</span>{" "}
                <span className="font-medium">{doctor.experience ?? "—"} yrs</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-500">Available Days:</span>
              {(doctor.availableDays || []).length ? (
                doctor.availableDays.map((d) => (
                  <span key={d} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-gray-600">—</span>
              )}
            </div>
            <div className="mt-2">
              <span className="text-gray-500">Available Time:</span>{" "}
              <span className="font-medium">{doctor.availableTime ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Booking Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleBook} className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                min={minDate}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`px-3 py-2 rounded-lg border text-sm transition ${
                      timeSlot === slot
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {!timeSlot && (
                <p className="text-xs text-gray-500 mt-2">
                  Select a time slot to continue.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/doctors")}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
              >
                Back to Doctors
              </button>
            </div>

            {/* Token hint */}
            {!token && (
              <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
                You must login first to book an appointment.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookDoctor;