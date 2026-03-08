import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import PredictionForm from "@/pages/PredictionForm";
import PredictionResult from "@/pages/PredictionResult";
import DoctorList from "@/pages/DoctorList";
import DoctorProfile from "@/pages/DoctorProfile";
import BookDoctor from "@/pages/BookDoctor";
import Appointments from "@/pages/Appointments";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/routes/ProtectedRoute";
import WoundPrediction from "@/pages/WoundPrediction";
import About from "@/pages/About";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />

            {/* ALIASES */}
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Diabetes prediction page */}
            <Route
              path="/predict"
              element={
                <ProtectedRoute>
                  <PredictionForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/result"
              element={
                <ProtectedRoute>
                  <PredictionResult />
                </ProtectedRoute>
              }
            />

            {/* Wound image prediction page - separate page */}
            <Route
              path="/wound"
              element={
                <ProtectedRoute>
                  <WoundPrediction />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <DoctorList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors/:id"
              element={
                <ProtectedRoute>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/book/:id"
              element={
                <ProtectedRoute>
                  <BookDoctor />
                </ProtectedRoute>
              }
            />

            <Route path="/book-doctor/:id" element={<Navigate to="/book/:id" replace />} />

            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}