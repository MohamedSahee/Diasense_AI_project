// frontend/src/components/DoctorCard.tsx (FULL REPLACE)

import { motion } from "framer-motion";
import { Star, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  experience: string;
  fee: number;
  available: boolean;
  image: string;

  // ✅ optional (if DoctorList passes custom paths)
  profilePath?: string;
  bookPath?: string;
}

export default function DoctorCard({
  id,
  name,
  specialty,
  rating,
  reviews,
  location,
  experience,
  fee,
  available,
  image,
  profilePath,
  bookPath,
}: DoctorCardProps) {
  const profileUrl = profilePath || `/doctors/${id}`;
  const bookUrl = bookPath || `/book/${id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl border border-border p-5 shadow-soft hover:shadow-medium transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-sm text-primary font-medium truncate">{specialty}</p>
            </div>

            <Badge
              variant={available ? "default" : "secondary"}
              className={available ? "bg-success text-accent-foreground" : ""}
            >
              {available ? "Available" : "Busy"}
            </Badge>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {experience}
            </span>

            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Rs. {fee}/visit
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {/* ✅ View Profile (clickable) */}
        <Link to={profileUrl} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>

        {/* ✅ Book Now */}
        <Link to={bookUrl} className="flex-1">
          <Button size="sm" className="w-full" disabled={!available}>
            Book Now
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}