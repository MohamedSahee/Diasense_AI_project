import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Activity, ArrowRight, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Gender = "male" | "female";

type FormState = {
  gender: Gender;
  glucose: number;
  bloodPressure: number;
  bmi: number;
  age: number;
  insulin: number;
  skinThickness: number;
  pregnancies: number;
  diabetesPedigree: number;
  symptoms: string;
};

const PredictionForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    gender: "male",
    glucose: 100,
    bloodPressure: 80,
    bmi: 25,
    age: 35,
    insulin: 80,
    skinThickness: 20,
    pregnancies: 0,
    diabetesPedigree: 0.5,
    symptoms: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "symptoms") {
      setFormData((prev) => ({ ...prev, symptoms: value }));
      return;
    }

    const num = value === "" ? 0 : Number(value);
    setFormData((prev) => ({ ...prev, [name]: num }));
  };

  const handleGenderChange = (gender: Gender) => {
    setFormData((prev) => ({
      ...prev,
      gender,
      pregnancies: gender === "male" ? 0 : prev.pregnancies,
    }));
  };

  const validateForm = () => {
    if (formData.glucose < 0 || formData.glucose > 300) {
      return "Glucose must be between 0 and 300.";
    }
    if (formData.bloodPressure < 0 || formData.bloodPressure > 200) {
      return "Blood pressure must be between 0 and 200.";
    }
    if (formData.bmi < 0 || formData.bmi > 70) {
      return "BMI must be between 0 and 70.";
    }
    if (formData.age < 1 || formData.age > 120) {
      return "Age must be between 1 and 120.";
    }
    if (formData.insulin < 0 || formData.insulin > 900) {
      return "Insulin must be between 0 and 900.";
    }
    if (formData.skinThickness < 0 || formData.skinThickness > 100) {
      return "Skin thickness must be between 0 and 100.";
    }
    if (formData.gender === "female" && formData.pregnancies < 0) {
      return "Pregnancies cannot be negative.";
    }
    if (formData.diabetesPedigree < 0 || formData.diabetesPedigree > 3) {
      return "Diabetes pedigree should be between 0 and 3.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Login required",
          description: "Please login first to run a prediction.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      const payload = {
        gender: formData.gender,
        pregnancies: formData.gender === "male" ? 0 : Number(formData.pregnancies),
        glucose: Number(formData.glucose),
        bloodPressure: Number(formData.bloodPressure),
        skinThickness: Number(formData.skinThickness),
        insulin: Number(formData.insulin),
        bmi: Number(formData.bmi),
        diabetesPedigree: Number(formData.diabetesPedigree),
        age: Number(formData.age),
        symptoms: String(formData.symptoms || ""),
      };

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result?.message ||
            result?.detail ||
            result?.details?.detail ||
            "Prediction failed"
        );
      }

      toast({
        title: "Prediction Complete",
        description: "Your results are ready to view.",
      });

      navigate("/result", { state: { formData: payload, result } });
    } catch (err: any) {
      toast({
        title: "Prediction Failed",
        description: err?.message || "Backend not reachable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const numberFields = [
    {
      name: "glucose",
      label: "Glucose Level",
      unit: "mg/dL",
      min: 0,
      max: 300,
      step: 1,
      tooltip:
        "Plasma glucose concentration after 2 hours in an oral glucose tolerance test",
    },
    {
      name: "bloodPressure",
      label: "Blood Pressure",
      unit: "mm Hg",
      min: 0,
      max: 200,
      step: 1,
      tooltip: "Diastolic blood pressure measurement",
    },
    {
      name: "bmi",
      label: "BMI",
      unit: "kg/m²",
      min: 0,
      max: 70,
      step: 0.1,
      tooltip: "Body Mass Index (weight/height²)",
    },
    {
      name: "age",
      label: "Age",
      unit: "years",
      min: 1,
      max: 120,
      step: 1,
      tooltip: "Your current age in years",
    },
    {
      name: "insulin",
      label: "Insulin Level",
      unit: "µU/mL",
      min: 0,
      max: 900,
      step: 1,
      tooltip: "2-hour serum insulin level",
    },
    {
      name: "skinThickness",
      label: "Skin Thickness",
      unit: "mm",
      min: 0,
      max: 100,
      step: 1,
      tooltip: "Triceps skin fold thickness measurement",
    },
  ] as const;

  const genderBtn = (g: Gender) =>
    `px-4 py-2 rounded-lg border text-sm font-medium transition ${
      formData.gender === g
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              AI Health Assessment
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Diabetes Risk <span className="text-gradient">Prediction</span>
            </h1>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your health information below. Our AI will analyze your data
              and provide a personalized risk assessment with recommendations.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Health Metrics</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {numberFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2"
                    >
                      {field.label}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" aria-label="Info">
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{field.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>

                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className="pr-20 h-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {field.unit}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Allowed range: {field.min} - {field.max} {field.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">
                Additional Information
              </h2>

              <div className="space-y-2 mb-6">
                <Label>Gender</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={genderBtn("male")}
                    onClick={() => handleGenderChange("male")}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={genderBtn("female")}
                    onClick={() => handleGenderChange("female")}
                  >
                    Female
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Sent to backend and saved to your prediction history.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {formData.gender === "female" && (
                  <div className="space-y-2">
                    <Label htmlFor="pregnancies">Number of Pregnancies</Label>
                    <Input
                      id="pregnancies"
                      name="pregnancies"
                      type="number"
                      min={0}
                      step={1}
                      value={formData.pregnancies}
                      onChange={handleInputChange}
                      placeholder="Enter number"
                      className="h-12"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="diabetesPedigree"
                    className="flex items-center gap-2"
                  >
                    Diabetes Pedigree Function
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label="Info">
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Scores likelihood of diabetes based on family history
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Input
                    id="diabetesPedigree"
                    name="diabetesPedigree"
                    type="number"
                    step="0.01"
                    min={0}
                    max={3}
                    value={formData.diabetesPedigree}
                    onChange={handleInputChange}
                    placeholder="0.0 - 3.0"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                <Textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="Describe any symptoms you've been experiencing..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">
                  Important Disclaimer
                </p>
                <p className="text-muted-foreground">
                  This AI prediction is for informational purposes only and
                  should not replace professional medical advice. Always consult
                  with a healthcare provider.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                variant="hero"
                size="xl"
                disabled={isLoading}
                className="min-w-[220px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get Prediction
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default PredictionForm;