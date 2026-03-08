// diasense-ai-dashboard/src/App.js (FULL REPLACE)
// ✅ Adds /users/:id route (UserDetails page)
// ✅ Keeps AdminRoute protection everywhere it’s needed

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails"; // ✅ NEW

// Optional pages (only keep if used)
import BookDoctor from "./pages/BookDoctor";
import Chatbot from "./pages/Chatbot";

// ✅ Role-based route protection (admin only)
import AdminRoute from "./utils/AdminRoute";

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ App always starts at login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ✅ Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Admin Protected */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <AdminRoute>
              <Doctors />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />

        {/* ✅ NEW: Per-user management page */}
        <Route
          path="/users/:id"
          element={
            <AdminRoute>
              <UserDetails />
            </AdminRoute>
          }
        />

        {/* Optional admin pages */}
        <Route
          path="/appointments"
          element={
            <AdminRoute>
              <BookDoctor />
            </AdminRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <AdminRoute>
              <Chatbot />
            </AdminRoute>
          }
        />

        

        {/* ✅ Redirect old/unused routes */}
        <Route path="/prediction" element={<Navigate to="/dashboard" replace />} />
        <Route path="/predictions" element={<Navigate to="/dashboard" replace />} />
        <Route path="/book-doctor" element={<Navigate to="/appointments" replace />} />

        {/* ✅ Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}