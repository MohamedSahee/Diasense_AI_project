// FRONTEND → src/routes/ProtectedRoute.tsx

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Props = { children: JSX.Element };

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const verify = async () => {
      setChecking(true);
      setServerError(null);

      const token = localStorage.getItem("token");

      // No token → must login
      if (!token) {
        if (!alive) return;
        setAllowed(false);
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Token invalid/expired
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (!alive) return;
          setAllowed(false);
          setChecking(false);
          return;
        }

        // Other server errors (500, etc.)
        if (!res.ok) {
          throw new Error(`Server error (${res.status})`);
        }

        // OK
        if (!alive) return;
        setAllowed(true);
      } catch (err: any) {
        // If backend is OFF / CORS / network issue → show message instead of redirect loop
        if (!alive) return;
        setServerError(err?.message || "Failed to reach server");
        setAllowed(false);
      } finally {
        if (!alive) return;
        setChecking(false);
      }
    };

    verify();

    return () => {
      alive = false;
    };
  }, []);

  // While checking token
  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Checking session...
      </div>
    );
  }

  // If backend/network problem, show message (helps you debug)
  if (serverError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold mb-2">Cannot reach backend</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your app can’t verify the login session because the backend is not
            reachable.
          </p>
          <div className="text-sm">
            <p className="font-medium">Error:</p>
            <p className="text-muted-foreground break-words">{serverError}</p>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Make sure:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>BACKEND is running on port 5000</li>
              <li>CORS allows http://localhost:8080</li>
              <li>VITE_API_URL in frontend/.env is correct</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in
  return children;
};

export default ProtectedRoute;