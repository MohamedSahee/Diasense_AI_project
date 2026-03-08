// diasense-frontend/src/pages/BookDoctor.tsx (FULL REPLACE)
// ✅ Fixes:
// 1) Uploaded image "/uploads/.." now resolves to "http://localhost:5000/uploads/.."
// 2) About section now shows real doctor.bio (no more hardcoded text)
// 3) Uses backend availableTimeSlots (array) if availableTime is not set
// 4) Safer API response handling (supports {doctor: {...}} or direct object)
// 5) Minor: fee label uses Rs. (your UI uses Rs. elsewhere)

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Video,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  availableDays?: string[];
  availableTime?: string;
  availableTimeSlots?: string[]; // ✅ backend field
  image?: string; // can be "/uploads/doctors/xxx.jpg"
  bio?: string; // ✅ backend field
  isActive?: boolean;
};

function toISODateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const DAY_MAP: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function normalizeDayToNumber(day: string) {
  const k = String(day || "").trim().toLowerCase();
  return DAY_MAP[k];
}

function parseTimeToMinutes(input: string) {
  let s = String(input || "").trim().toLowerCase();
  if (!s) return null;

  s = s.replace(/\s+/g, "");

  const m24 = s.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (m24) {
    const h = Number(m24[1]);
    const min = Number(m24[2] || "0");
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return h * 60 + min;
    return null;
  }

  const m12 = s.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (!m12) return null;

  let h = Number(m12[1]);
  const min = Number(m12[2] || "0");
  const ap = m12[3];

  if (h < 1 || h > 12 || min < 0 || min > 59) return null;
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;

  return h * 60 + min;
}

function minutesToLabel(total: number) {
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const ap = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

function generateSlots(availableTime?: string, slotMinutes = 30) {
  const s = String(availableTime || "").trim();
  if (!s) return [];

  const parts = s.split("-").map((x) => x.trim());
  if (parts.length < 2) return [];

  const startMin = parseTimeToMinutes(parts[0]);
  const endMin = parseTimeToMinutes(parts[1]);

  if (startMin === null || endMin === null) return [];
  if (endMin <= startMin) return [];

  const out: string[] = [];
  for (let t = startMin; t + slotMinutes <= endMin; t += slotMinutes) {
    out.push(minutesToLabel(t));
  }
  return out;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face";

const BookDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorErr, setDoctorErr] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<"video" | "clinic">("video");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ backend base (remove /api)
  const SERVER_BASE = useMemo(() => {
    const base = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:5000/api";
    return String(base).replace(/\/api\/?$/, "");
  }, []);

  const resolveImg = (img?: string) => {
    if (!img) return FALLBACK_IMG;
    if (/^https?:\/\//i.test(img)) return img;
    return `${SERVER_BASE}${img.startsWith("/") ? img : `/${img}`}`;
  };

  // Load doctor from DB
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingDoctor(true);
        setDoctorErr("");

        if (!id) {
          setDoctorErr("Doctor id not found in URL");
          setDoctor(null);
          return;
        }

        const data: any = await api.doctorById(id);

        // ✅ accept {doctor: {...}} OR direct doctor
        const doc = data?.doctor ? data.doctor : data;

        if (!doc?._id) {
          setDoctorErr("Doctor not found");
          setDoctor(null);
          return;
        }

        setDoctor(doc);
      } catch (e: any) {
        setDoctorErr(e?.message || "Failed to load doctor");
        setDoctor(null);
      } finally {
        setLoadingDoctor(false);
      }
    };
    run();
  }, [id]);

  const allowedDayNumbers = useMemo(() => {
    const days = doctor?.availableDays || [];
    const nums = days
      .map(normalizeDayToNumber)
      .filter((v) => typeof v === "number") as number[];
    return nums.length ? nums : [1, 2, 3, 4, 5, 6];
  }, [doctor?.availableDays]);

  // ✅ choose time range text from either availableTime or availableTimeSlots[0]
  const timeRangeText = useMemo(() => {
    const t1 = String(doctor?.availableTime || "").trim();
    if (t1) return t1;

    const slots = (doctor as any)?.availableTimeSlots;
    const first = Array.isArray(slots) && slots.length ? String(slots[0] || "").trim() : "";
    return first;
  }, [doctor]);

  const timeSlots = useMemo(() => {
    const slots = generateSlots(timeRangeText, 30);
    return slots.length
      ? slots
      : [
          "09:00 AM",
          "09:30 AM",
          "10:00 AM",
          "10:30 AM",
          "11:00 AM",
          "11:30 AM",
          "02:00 PM",
          "02:30 PM",
          "03:00 PM",
          "03:30 PM",
          "04:00 PM",
          "04:30 PM",
        ];
  }, [timeRangeText]);

  const doctorDisplay = useMemo(() => {
    if (!doctor) return null;

    const availableTime = timeRangeText || "Not set";

    return {
      name: doctor.name,
      specialty: doctor.specialization,
      rating: doctor.rating ?? 4.5,
      reviews: 150,
      location: doctor.location || doctor.hospital || "—",
      experience: `${doctor.experience ?? 0}+ years`,
      fee: doctor.fee ?? 0,
      image: resolveImg(doctor.image), // ✅ FIX
      bio: doctor.bio?.trim() ? doctor.bio : "No bio added yet.", // ✅ FIX
      education: ["MBBS", "Specialist Consultation"],
      languages: ["English"],
      active: doctor.isActive !== false,
      availableDays: (doctor.availableDays || []).join(", ") || "Not set",
      availableTime,
    };
  }, [doctor, timeRangeText, SERVER_BASE]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Login required",
        description: "Please login first to book an appointment.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!doctor || !doctor._id) {
      toast({
        title: "Doctor not found",
        description: "Please go back and select a doctor again.",
        variant: "destructive",
      });
      return;
    }

    if (doctor.isActive === false) {
      toast({
        title: "Doctor Busy",
        description: "This doctor is inactive/busy. You cannot book now.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "Choose an available slot to proceed with booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      await api.bookAppointment({
        doctorId: doctor._id,
        appointmentDate: toISODateOnly(selectedDate),
        timeSlot: selectedTime,
        reason: consultationType === "video" ? "Video consultation" : "Clinic consultation",
      });

      toast({
        title: "Appointment Booked!",
        description: `Your ${consultationType} consultation with ${doctorDisplay?.name} is booked for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });

      navigate("/appointments");
    } catch (e: any) {
      toast({
        title: "Booking failed",
        description: e?.message || "Please try another slot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </Button>

          {loadingDoctor && (
            <div className="bg-card border border-border rounded-2xl p-6">Loading doctor...</div>
          )}

          {!loadingDoctor && doctorErr && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-destructive font-medium">{doctorErr}</p>
              <Button className="mt-4" onClick={() => navigate("/doctors")}>
                Back to Doctors
              </Button>
            </div>
          )}

          {!loadingDoctor && doctorDisplay && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Doctor Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-4 bg-muted">
                      <img
                        src={doctorDisplay.image}
                        alt={doctorDisplay.name}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
                      />
                    </div>
                    <h2 className="text-xl font-semibold">{doctorDisplay.name}</h2>
                    <p className="text-primary font-medium">{doctorDisplay.specialty}</p>

                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="font-medium">{doctorDisplay.rating}</span>
                      <span className="text-muted-foreground">({doctorDisplay.reviews} reviews)</span>
                    </div>

                    <div className="mt-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          doctorDisplay.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {doctorDisplay.active ? "Available" : "Busy"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{doctorDisplay.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{doctorDisplay.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Rs. {doctorDisplay.fee} per consultation</span>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <div>
                        <b>Available Days:</b> {doctorDisplay.availableDays}
                      </div>
                      <div>
                        <b>Available Time:</b> {doctorDisplay.availableTime}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {doctorDisplay.bio}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Education</h3>
                    <ul className="space-y-1">
                      {doctorDisplay.education.map((edu) => (
                        <li
                          key={edu}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Booking Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-4">Consultation Type</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setConsultationType("video")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        consultationType === "video"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Video className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Video Call</p>
                      <p className="text-sm text-muted-foreground">Consult online</p>
                    </button>

                    <button
                      onClick={() => setConsultationType("clinic")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        consultationType === "clinic"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Building2 className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Clinic Visit</p>
                      <p className="text-sm text-muted-foreground">In-person visit</p>
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-4">Select Date</h2>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (date < today) return true;
                        if (!allowedDayNumbers.includes(date.getDay())) return true;
                        return false;
                      }}
                      className="rounded-xl border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    You can only select the doctor’s available days.
                  </p>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-4">Select Time</h2>

                  {!selectedDate ? (
                    <p className="text-muted-foreground text-center py-4">Please select a date first</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
                  >
                    <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Doctor</span>
                        <span className="font-medium">{doctorDisplay.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{consultationType} Consultation</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Total Fee</span>
                        <span className="font-bold text-primary">Rs. {doctorDisplay.fee}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      className="w-full"
                      size="lg"
                      disabled={isLoading || doctorDisplay.active === false}
                    >
                      {doctorDisplay.active === false
                        ? "Doctor Busy"
                        : isLoading
                        ? "Booking..."
                        : "Confirm Booking"}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default BookDoctor;