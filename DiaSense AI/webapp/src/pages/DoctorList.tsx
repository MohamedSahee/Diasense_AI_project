import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import DoctorCard from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X } from "lucide-react";
import { api } from "@/lib/api";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  rating?: number;
  location?: string;
  hospital?: string;
  experience?: number;
  fee?: number;
  isActive?: boolean;
  image?: string;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop";

export default function DoctorList() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 2000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

  const resolveImg = (img?: string) => {
    if (!img) return FALLBACK_IMG;
    if (/^https?:\/\//i.test(img)) return img;
    const path = img.startsWith("/") ? img : `/${img}`;
    return `${SERVER_BASE}${path}`;
  };

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.doctors({ includeInactive: true });
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || "Failed to load doctors");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const maxDoctorFee = useMemo(() => {
    if (doctors.length === 0) return 2000;
    const maxFee = Math.max(...doctors.map((d) => Number(d.fee || 0)));
    return Math.max(2000, maxFee);
  }, [doctors]);

  useEffect(() => {
    setFeeRange([0, maxDoctorFee]);
  }, [maxDoctorFee]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization?.trim()) set.add(d.specialization);
    });
    return ["All Specialties", ...Array.from(set)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const combined =
        `${doctor.name} ${doctor.specialization} ${doctor.location || ""} ${doctor.hospital || ""}`.toLowerCase();

      const matchesSearch = !q || combined.includes(q);
      const matchesSpecialty =
        specialty === "All Specialties" || doctor.specialization === specialty;

      const fee = Number(doctor.fee || 0);
      const matchesFee = fee >= feeRange[0] && fee <= feeRange[1];

      const matchesAvailability =
        !showAvailableOnly || doctor.isActive !== false;

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesFee &&
        matchesAvailability
      );
    });
  }, [doctors, searchQuery, specialty, feeRange, showAvailableOnly]);

  const resetFilters = () => {
    setSearchQuery("");
    setSpecialty("All Specialties");
    setFeeRange([0, maxDoctorFee]);
    setShowAvailableOnly(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-3xl font-bold md:text-5xl">
              Find <span className="text-gradient">Expert Doctors</span>
            </h1>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-lg">
              Browse doctors from the database. Available doctors can be booked,
              while unavailable doctors are shown clearly for easier selection.
            </p>
          </motion.div>

          {loading && (
            <div className="rounded-2xl border border-border bg-card p-6">
              Loading doctors...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-destructive">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors by name, specialty, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>

                <Button
                  variant="outline"
                  className="h-12 min-w-[140px]"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Filters"}
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mb-6 overflow-hidden rounded-3xl border border-border bg-card"
                  >
                    <div className="p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-semibold">Filters</h3>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                          >
                            Reset
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowFilters(false)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Close filters"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Specialty</Label>
                          <Select value={specialty} onValueChange={setSpecialty}>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {specialties.map((spec) => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label>
                            Fee Range (Rs. {feeRange[0]} - Rs. {feeRange[1]})
                          </Label>
                          <Slider
                            value={feeRange}
                            onValueChange={(value) =>
                              setFeeRange([value[0], value[1]])
                            }
                            min={0}
                            max={maxDoctorFee}
                            step={10}
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-7">
                          <input
                            id="availableOnly"
                            type="checkbox"
                            checked={showAvailableOnly}
                            onChange={(e) =>
                              setShowAvailableOnly(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-border"
                          />
                          <Label htmlFor="availableOnly">
                            Show available doctors only
                          </Label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDoctors.length} of {doctors.length} doctors
                </p>

                {showFilters && (
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Close filters
                  </button>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => {
                  const available = doctor.isActive !== false;

                  return (
                    <DoctorCard
                      key={doctor._id}
                      id={doctor._id}
                      name={doctor.name}
                      specialty={doctor.specialization}
                      rating={doctor.rating ?? 4.5}
                      reviews={150}
                      location={doctor.location || doctor.hospital || "—"}
                      experience={`${doctor.experience ?? 0}+ years`}
                      fee={doctor.fee ?? 0}
                      available={available}
                      image={resolveImg(doctor.image)}
                      profilePath={`/doctors/${doctor._id}`}
                      bookPath={`/book/${doctor._id}`}
                    />
                  );
                })}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="py-14 text-center">
                  <p className="mb-4 text-muted-foreground">
                    No doctors found for the selected filters.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
}