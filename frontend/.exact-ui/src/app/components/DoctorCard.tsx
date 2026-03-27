import { Link } from "react-router";
import { MapPin, Star, DollarSign, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  image: string;
  location: string;
  fee: number;
  experience: number;
  rating: number;
  reviews: number;
  featured?: boolean;
}

export function DoctorCard({
  id,
  name,
  specialization,
  image,
  location,
  fee,
  experience,
  rating,
  reviews,
  featured = false,
}: DoctorCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${
        featured ? "border-teal-500" : "border-transparent hover:border-teal-200"
      }`}
    >
      {featured && (
        <Badge className="mb-3 bg-gradient-to-r from-teal-600 to-blue-600">
          Top Match
        </Badge>
      )}
      <div className="flex gap-4">
        {/* Doctor Image */}
        <div className="flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-24 h-24 rounded-2xl object-cover"
          />
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-1 truncate">{name}</h3>
          <p className="text-teal-600 font-medium mb-2">{specialization}</p>

          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="font-medium">${fee}</span>
              <span className="text-gray-500">/session</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{experience} yrs</span>
              <span className="text-gray-500">exp.</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{rating}</span>
              <span className="text-gray-500">({reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link to={`/user/doctor/${id}`} className="block mt-4">
        <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-90">
          View Profile
        </Button>
      </Link>
    </div>
  );
}
