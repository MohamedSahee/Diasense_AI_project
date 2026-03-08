// diasense-ai-dashboard/src/utils/AdminRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // 🚫 Not logged in
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // 🚫 If user object invalid OR not admin
    if (!user || user.role !== "admin") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }

    // ✅ Valid admin
    return children;

  } catch (error) {
    // 🚫 If JSON parsing fails (corrupted localStorage)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
}