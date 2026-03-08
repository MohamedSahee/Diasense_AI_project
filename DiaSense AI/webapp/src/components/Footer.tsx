import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-white/95 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr_1.1fr_1.2fr] xl:items-start">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft">
                <Activity className="h-5 w-5 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold leading-none text-slate-900">
                  DiaSense
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI-Powered Diabetes Care
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Smart diabetes prediction, secure health reports, and personalized
              wellness guidance in one professional platform.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
                <HeartPulse className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-slate-700">
                  AI Insights
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">
                  Secure Reports
                </span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-3 text-base font-bold text-slate-900">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/predict"
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Predict
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors"
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Find Doctors
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-base font-bold text-slate-900">
              Resources
            </h4>

            <div className="space-y-2.5">
              <a
                href="https://www.who.int/health-topics/diabetes"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    WHO Diabetes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Global guidance
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </a>

              <a
                href="https://www.cdc.gov/diabetes/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    CDC Diabetes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Care and prevention
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </a>

              <a
                href="https://diabetesjournals.org/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Research Journals
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clinical articles
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-base font-bold text-slate-900">
              Contact & Disclaimer
            </h4>

            <div className="space-y-2.5">
              <a
                href="mailto:DiaSense@AI.com"
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="text-sm text-slate-700">
                  DiaSenseAI.COM
                </span>
              </a>

              <a
                href="tel:+940755689698"
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-slate-700">+94 0755689698</span>
              </a>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-sm text-slate-700">
                  ICBT Campus, Sri Lanka
                </span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="text-xs leading-5 text-amber-800">
                  <span className="font-semibold text-amber-900">
                    Disclaimer:
                  </span>{" "}
                  AI support tool only. Not a substitute for professional
                  medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} DiaSense. All rights reserved.</p>

          <div className="flex flex-wrap gap-4">
            <Link to="/" className="transition hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/" className="transition hover:text-primary">
              Terms
            </Link>
            <Link to="/" className="transition hover:text-primary">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;