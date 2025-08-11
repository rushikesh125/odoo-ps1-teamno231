import { MapPin, Star } from "lucide-react";
import Link from "next/link";

const FacilityCard = ({ facility }) => {
  // Calculate average rating (mock data since we don't have real reviews yet)
  const averageRating = (Math.random() * 2 + 3).toFixed(1); // Random between 3-5
  const reviewCount = Math.floor(Math.random() * 50) + 10; // Random between 10-60

  return (
    <Link 
      href={`/facility/${facility.id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-200"
    >
      <div className="relative h-48">
        {facility.photos && facility.photos.length > 0 ? (
          <img 
            src={facility.photos[0]} 
            alt={facility.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            <div className="text-gray-500">No image</div>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm font-medium flex items-center">
          <Star className="text-yellow-500 fill-current mr-1" size={16} />
          {averageRating}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{facility.name}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm truncate">
            {facility.location?.city}, {facility.location?.state}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ₹{facility.sports?.[0]?.pricePerHour || 0}
            </span>
            <span className="text-gray-600 text-sm">/hour</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>{reviewCount} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FacilityCard;