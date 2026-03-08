import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import UserHelpSection from "@/components/UserHelpSection";

import {
  Activity,
  Brain,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Stethoscope,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Prediction",
    description: "Advanced machine learning algorithms analyze your health data to provide accurate diabetes risk assessment.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and protected. We prioritize your privacy and comply with healthcare standards.",
  },
  {
    icon: Users,
    title: "Expert Doctors",
    description: "Connect with certified healthcare professionals specializing in diabetes care and prevention.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your health journey with interactive dashboards and personalized insights.",
  },
];

const stats = [
  { value: "95%", label: "Prediction Accuracy" },
  { value: "50K+", label: "Users Helped" },
  { value: "500+", label: "Partner Doctors" },
  { value: "24/7", label: "AI Support" },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Health Intelligence
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Take Control of Your{" "}
                <span className="text-gradient">Diabetes Risk</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                DiaSense uses advanced AI to predict your diabetes risk, provide personalized health insights, and connect you with expert doctors. Start your journey to better health today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/predict">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Start Prediction
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Find Doctors
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                {stats.slice(0, 3).map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main Circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse-slow" />
                
                {/* Inner Circle with Icon */}
                <div className="absolute inset-12 rounded-full bg-card shadow-strong flex items-center justify-center">
                  <Activity className="w-32 h-32 text-primary" />
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-10 right-10 p-4 bg-card rounded-2xl shadow-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                      <p className="font-semibold text-success">Low Risk</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute bottom-20 left-0 p-4 bg-card rounded-2xl shadow-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Doctors</p>
                      <p className="font-semibold">500+ Available</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient">DiaSense</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with healthcare expertise to provide you with the most accurate and personalized diabetes risk assessment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your diabetes risk assessment in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Enter Your Data",
                description: "Provide basic health information like glucose levels, BMI, blood pressure, and age.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our advanced AI analyzes your data using machine learning algorithms trained on medical datasets.",
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive your risk assessment with personalized recommendations and next steps.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground text-xl font-bold mb-6">
                  {item.step}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of users who have already discovered their diabetes risk and taken proactive steps towards a healthier life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="heroOutline" size="xl">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/predict">
                <Button variant="heroOutline" size="xl">
                  Try Prediction Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
<UserHelpSection />
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Home;
