import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Brain,
  Activity,
  ShieldCheck,
  Stethoscope,
  Database,
  Cpu,
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto max-w-7xl px-4">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              About DiaSense AI
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
              DiaSense is an AI-powered diabetes prediction system designed to
              help individuals understand their diabetes risk through health
              data analysis and machine learning models.
            </p>
          </div>

          {/* Core Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">

            <div className="rounded-3xl border border-border p-6 shadow-soft bg-card">
              <Brain className="text-blue-600 mb-3" size={28} />
              <h3 className="text-xl font-semibold mb-2">
                AI Prediction Model
              </h3>
              <p className="text-sm text-muted-foreground">
                Machine learning algorithms analyze health indicators like
                glucose, BMI, insulin, and age to estimate diabetes risk.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-6 shadow-soft bg-card">
              <Activity className="text-green-600 mb-3" size={28} />
              <h3 className="text-xl font-semibold mb-2">
                Health Monitoring
              </h3>
              <p className="text-sm text-muted-foreground">
                Track key health metrics and evaluate risk factors associated
                with diabetes through our predictive system.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-6 shadow-soft bg-card">
              <Stethoscope className="text-purple-600 mb-3" size={28} />
              <h3 className="text-xl font-semibold mb-2">
                Doctor Consultation
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect with healthcare professionals and book consultations
                based on your AI prediction results.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-6 shadow-soft bg-card">
              <ShieldCheck className="text-amber-600 mb-3" size={28} />
              <h3 className="text-xl font-semibold mb-2">
                Secure Medical Reports
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate downloadable medical-style reports with prediction
                results and health insights.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-6 shadow-soft bg-card">
              <Database className="text-indigo-600 mb-3" size={28} />
              <h3 className="text-xl font-semibold mb-2">
                Health Data Storage
              </h3>
              <p className="text-sm text-muted-foreground">
                Secure MongoDB database stores user health metrics and
                prediction history for analysis.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-6 shadow-soft bg-card">
              <Cpu className="text-rose-600 mb-3" size={28} />
              <h3 className="text-xl font-semibold mb-2">
                ML Model Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                A dedicated ML service processes health inputs and provides
                accurate prediction responses to the system.
              </p>
            </div>

          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20">

            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Our Mission
              </h2>

              <p className="text-muted-foreground leading-7">
                Diabetes is one of the fastest-growing chronic diseases
                worldwide. Early detection and prevention play a crucial role
                in reducing long-term complications.
              </p>

              <p className="mt-4 text-muted-foreground leading-7">
                DiaSense aims to use artificial intelligence to assist
                individuals in identifying potential diabetes risk factors
                early and encouraging healthier lifestyle decisions.
              </p>

              <p className="mt-4 text-muted-foreground leading-7">
                By combining machine learning, medical insights, and modern web
                technologies, our platform provides accessible health
                intelligence to users globally.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-medium">
              <h3 className="text-xl font-semibold mb-4">
                Important Medical Disclaimer
              </h3>

              <p className="text-sm text-muted-foreground leading-7">
                DiaSense is an AI-powered support tool designed for educational
                and wellness purposes only.
              </p>

              <p className="mt-3 text-sm text-muted-foreground leading-7">
                The predictions generated by this system should not be
                considered as medical diagnosis. Always consult a qualified
                healthcare professional for proper medical advice, diagnosis,
                or treatment.
              </p>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;