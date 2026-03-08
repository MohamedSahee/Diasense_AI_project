import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordRequirements = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains a number", met: /\d/.test(password) },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    ],
    [password]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    // (Optional) enforce your UI rules (since backend might not enforce)
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      toast({
        title: "Weak password",
        description:
          "Password must be 8+ characters and include a number + uppercase letter.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // backend may return {message} or {error}
        throw new Error(data?.message || data?.error || "Registration failed");
      }

      toast({
        title: "Account created!",
        description: "Now login using your email and password.",
      });

      // Go to login page (correct flow)
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err?.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-primary-foreground max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-8">
            <Activity className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Join DiaSense Today</h2>
          <p className="text-primary-foreground/80 leading-relaxed mb-8">
            Create your account and get access to AI-powered diabetes risk
            assessment, personalized insights, and a network of healthcare
            professionals.
          </p>
          <ul className="space-y-3">
            {[
              "Free diabetes risk prediction",
              "Personalized health recommendations",
              "Connect with expert doctors",
              "Track your health progress",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
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
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground mt-2">
              Start your health journey with DiaSense
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {password && (
                <div className="space-y-1 pt-2">
                  {passwordRequirements.map((req) => (
                    <p
                      key={req.label}
                      className={`text-xs flex items-center gap-2 ${
                        req.met ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3 h-3 ${
                          req.met ? "opacity-100" : "opacity-40"
                        }`}
                      />
                      {req.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="rounded border-input mt-1"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;