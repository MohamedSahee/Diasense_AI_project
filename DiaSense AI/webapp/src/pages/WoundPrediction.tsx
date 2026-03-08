import { useState } from "react";
import {
  Upload,
  ImagePlus,
  ScanLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import { api } from "../lib/api";
import Navbar from "@/components/NavBar";

export default function WoundPrediction() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [woundDetected, setWoundDetected] = useState<boolean | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [woundArea, setWoundArea] = useState<number | null>(null);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setImage(file);
    setMask(null);
    setWoundDetected(null);
    setSeverity(null);
    setRecommendation(null);
    setWoundArea(null);

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const result = await api.woundPredict(image);

      setMask("data:image/png;base64," + result.mask);
      setWoundDetected(result.wound_detected);
      setSeverity(result.severity);
      setRecommendation(result.recommendation);
      setWoundArea(result.wound_area_percent);
    } catch (err: any) {
      alert(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto max-w-7xl px-4 pb-14">
          {/* Header */}
          <div className="mx-auto mb-10 max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <ScanLine className="h-4 w-4" />
              AI Wound Segmentation
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Wound Image <span className="text-primary">Prediction</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Upload a wound image and let the AI generate a segmentation mask to
              highlight the affected region clearly and accurately.
            </p>
          </div>

          {/* Upload + Workflow */}
          <div className="mx-auto mb-10 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="grid items-stretch gap-6 lg:grid-cols-2">
              {/* Upload Card */}
              <div className="rounded-2xl border border-border bg-background p-5">
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  Upload Medical Image
                </h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP
                </p>

                <label className="block cursor-pointer">
                  <div className="flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center transition hover:border-primary/50 hover:bg-primary/10">
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="Preview"
                          className="mb-4 h-52 w-full rounded-xl border border-border bg-white object-contain"
                        />
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Image selected
                        </div>
                        <p className="max-w-full truncate text-sm text-muted-foreground">
                          {image?.name}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ImagePlus className="h-8 w-8" />
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                          Choose an image
                        </h3>

                        <p className="mb-4 text-sm text-muted-foreground">
                          Drag and drop or click to browse from your computer
                        </p>

                        <span className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">
                          <Upload className="mr-2 inline h-4 w-4" />
                          Select File
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSelectImage}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>

              {/* Workflow Card */}
              <div className="flex flex-col rounded-2xl border border-border bg-muted/20 p-5">
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  Prediction Workflow
                </h3>

                <div className="space-y-3">
                  {[
                    "Upload a wound image",
                    "AI analyzes the image",
                    "Segmentation mask is generated",
                    "Review the predicted result",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="rounded-xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground"
                    >
                      {index + 1}. {step}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!image || loading}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Run Prediction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-semibold text-foreground">
                Prediction Results
              </h2>
              <p className="mt-2 text-muted-foreground">
                Compare the uploaded image with the generated segmentation mask.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Original Image */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Original Image
                </h3>

                <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-4">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImagePlus className="mx-auto mb-3 h-10 w-10 opacity-50" />
                      <p>No image selected yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Predicted Mask */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Predicted Mask
                </h3>

                <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-4">
                  {mask ? (
                    <img
                      src={mask}
                      alt="Predicted Mask"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ScanLine className="mx-auto mb-3 h-10 w-10 opacity-50" />
                      <p>Prediction result will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            {severity && recommendation && woundArea !== null && woundDetected !== null && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Analysis Summary
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Wound Detected</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {woundDetected ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Wound Area</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {woundArea}%
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Severity</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {severity}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Recommendation</p>
                    <p className="mt-1 text-sm leading-6 text-foreground">
                      {recommendation}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <p>
                      This AI result is an assistive tool only and should not be
                      considered a final medical diagnosis. Please consult a healthcare
                      professional for proper evaluation and treatment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}