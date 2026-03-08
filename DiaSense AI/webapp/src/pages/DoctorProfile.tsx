// diasense-frontend/src/pages/DoctorProfile.tsx (FULL REPLACE)

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, DollarSign } from "lucide-react";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  bio?: string;
  location?: string;
  hospital?: string;
  experience?: number;
  fee?: number;
  image?: string; // can be "/uploads/.."
  isActive?: boolean;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // backend base (remove /api)
  const SERVER_BASE = useMemo(() => {
    const base = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:5000/api";
    return String(base).replace(/\/api\/?$/, "");
  }, []);

  const resolveImg = (img?: string) => {
    if (!img) return FALLBACK_IMG;
    if (/^https?:\/\//i.test(img)) return img;
    return `${SERVER_BASE}${img.startsWith("/") ? img : `/${img}`}`;
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        if (!id) return setErr("Doctor id missing");

        const data: any = await api.doctorById(id);

        // safety: accept {doctor: {...}} OR direct object
        const doc = data?.doctor ? data.doctor : data;

        if (!doc?._id) {
          setErr("Doctor not found");
          setDoctor(null);
          return;
        }

        setDoctor(doc);
      } catch (e: any) {
        setErr(e?.message || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">Loading...</div>
      </div>
    );
  }

  if (err || !doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <p className="text-destructive">{err || "Doctor not found"}</p>
          <Button className="mt-4" onClick={() => navigate("/doctors")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="bg-card border border-border rounded-2xl p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={resolveImg(doctor.image)}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{doctor.name}</h1>
                <p className="text-primary font-medium">{doctor.specialization}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex gap-2 items-center">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{doctor.location || doctor.hospital || "—"}</span>
                </div>

                <div className="flex gap-2 items-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{doctor.experience ?? 0}+ years</span>
                </div>

                <div className="flex gap-2 items-center">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Rs. {doctor.fee ?? 0}</span>
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={doctor.isActive === false ? "text-destructive" : "text-emerald-600"}>
                    {doctor.isActive === false ? "Inactive" : "Available"}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="font-semibold">About</h2>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {doctor.bio?.trim() ? doctor.bio : "No bio added yet."}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <Link to={`/book/${doctor._id}`}>
                  <Button>Book Now</Button>
                </Link>
                <Link to="/doctors">
                  <Button variant="outline">Back to Doctors</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}