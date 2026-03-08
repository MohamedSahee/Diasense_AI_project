import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/predict", label: "Predict" },
    { to: "/doctors", label: "Find Doctors" },
    { to: "/wound", label: "Image Prediction" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-glass backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft transition-shadow duration-300 group-hover:shadow-glow">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">DiaSense AI</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!token ? (
              <>
                <Link to="/login">
                  <Button type="button" variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>

                <Link to="/register">
                  <Button type="button" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-card md:hidden"
          >
            <div className="container mx-auto space-y-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="space-y-2 border-t border-border pt-4">
                {!token ? (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button type="button" variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>

                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button type="button" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;