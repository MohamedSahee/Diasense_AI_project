import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:5000/api";

type LocationState = {
  from?: string;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // ✅ If ProtectedRoute sent state.from, go back there after login
  const from = (location.state as LocationState | null)?.from || "/dashboard";

  // ✅ If already logged in, skip login page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      if (!data?.token) {
        throw new Error("Token not received from server");
      }

      // ✅ Save JWT + user
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("user");
      }

      toast({
        title: "Login successful",
        description: data?.user?.name
          ? `Welcome ${data.user.name}`
          : "Welcome back!",
      });

      // ✅ Go to attempted page or dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      // ✅ Clear any old token (important)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast({
        title: "Login failed",
        description: err?.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">DiaSense</span>
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-input" />
                Remember me
              </label>
              <span className="text-sm text-muted-foreground">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>  
          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
            <Activity className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">DiaSense AI</h2>
          <p className="text-primary-foreground/80 leading-relaxed">
            Your personal AI-powered health companion for diabetes risk prediction
            and management.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;