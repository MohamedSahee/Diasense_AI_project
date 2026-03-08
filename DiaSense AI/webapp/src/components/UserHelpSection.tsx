import React from "react";
import {
  BadgeHelp,
  Activity,
  FileText,
  Stethoscope,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserHelpSection = () => {
  const navigate = useNavigate();

  const helpCards = [
    {
      icon: <Activity className="h-5 w-5 text-blue-600" />,
      title: "Start a New Prediction",
      description:
        "Enter your health metrics to get an AI-based diabetes risk assessment with personalized recommendations.",
      action: () => navigate("/predict"),
      buttonText: "Go to Prediction",
      bg: "bg-blue-50",
    },
    {
      icon: <FileText className="h-5 w-5 text-emerald-600" />,
      title: "View Your Reports",
      description:
        "Access your past prediction history, review health insights, and download professional medical-style reports.",
      action: () => navigate("/reports"),
      buttonText: "Open Reports",
      bg: "bg-emerald-50",
    },
    {
      icon: <Stethoscope className="h-5 w-5 text-purple-600" />,
      title: "Find Doctors",
      description:
        "Browse available doctors and book a consultation if you want professional medical guidance after your result.",
      action: () => navigate("/doctors"),
      buttonText: "Find Doctors",
      bg: "bg-purple-50",
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-amber-600" />,
      title: "Get Help from AI Assistant",
      description:
        "Use the built-in chatbot to ask simple questions about diabetes, reports, risk levels, and platform usage.",
      action: () => {
        const chatButton = document.querySelector(
          '[data-chatbot-trigger=\"true\"]'
        ) as HTMLButtonElement | null;
        if (chatButton) chatButton.click();
      },
      buttonText: "Open Chat Assistant",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="rounded-[32px] border border-border bg-white p-6 shadow-soft md:p-10">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <BadgeHelp className="h-4 w-4" />
                User Help Center
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Need help using DiaSense?
              </h2>

              <p className="mt-3 max-w-2xl text-muted-foreground">
                Get quick guidance for predictions, reports, doctor consultation,
                and health support — all in one place.
              </p>
            </div>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {helpCards.map((card, index) => (
              <div
                key={index}
                className="rounded-3xl border border-border bg-background p-5 transition hover:-translate-y-1 hover:shadow-medium"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg}`}
                >
                  {card.icon}
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  {card.title}
                </h3>

                <p className="mt-3 min-h-[96px] text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>

                <Button
                  variant="ghost"
                  className="mt-4 px-0 text-primary hover:bg-transparent"
                  onClick={card.action}
                >
                  {card.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-border bg-muted/30 p-6">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-xl font-semibold text-slate-900">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4">
                  <p className="font-semibold text-slate-900">
                    Is this prediction a medical diagnosis?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    No. DiaSense provides AI-based risk assessment for support
                    and awareness only. It should not replace professional
                    medical diagnosis or treatment.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="font-semibold text-slate-900">
                    Where can I see my previous predictions?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    You can view all your previous prediction records and reports
                    in the Reports section from the dashboard.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="font-semibold text-slate-900">
                    What should I do if my risk level is high?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Review the recommendations, monitor your health values, and
                    consult a doctor as soon as possible for proper medical
                    evaluation.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-xl font-semibold text-amber-900">
                Medical Disclaimer
              </h3>
              <p className="mt-3 text-sm leading-7 text-amber-800">
                DiaSense is an AI-powered support tool designed for educational
                and wellness guidance. It should not replace professional
                medical advice, diagnosis, or treatment. Always consult a
                qualified healthcare provider for medical decisions.
              </p>

              <div className="mt-5 rounded-2xl bg-white/70 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Need direct support?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use the contact details in the footer or talk to the AI
                  assistant for general guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserHelpSection;