import { Calendar, Clock } from "lucide-react";

const CourtCard = ({ court, sport, onBook }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            court.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {court.status === 'active' ? 'Available' : 'Unavailable'}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <Clock className="mr-2" size={16} />
          <span>₹{sport.pricePerHour}/hour</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <Calendar className="mr-2" size={16} />
          <span>Book for specific time slots</span>
        </div>
        
        <button
          onClick={onBook}
          disabled={court.status !== 'active'}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            court.status === 'active'
              ? 'bg-theme-purple text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {court.status === 'active' ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default CourtCard;