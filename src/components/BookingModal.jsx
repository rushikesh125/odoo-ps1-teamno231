import { useState } from "react";
import { X, Calendar, Clock, User, CreditCard, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

const BookingModal = ({ facility, sport, court, onClose, user }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to create a booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Booking confirmed!');
      onClose();
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!facility || !sport || !court) {
    return null;
  }

  const totalPrice = sport.pricePerHour * duration;

  return (
    <div className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book Court</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{facility.name}</h3>
        <p className="text-gray-700 font-medium">{court.name} - {sport.name}</p>
        <div className="mt-3 flex items-center">
          <span className="text-xl font-bold text-theme-purple">₹{sport.pricePerHour}<span className="text-sm font-normal text-gray-600">/hour</span></span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Booking Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-purple focus:border-theme-purple shadow-sm transition-all"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time Slot
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-purple focus:border-theme-purple shadow-sm appearance-none transition-all"
              required
            >
              <option value="">Select time</option>
              <option value="08:00">08:00 AM</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="17:00">05:00 PM</option>
              <option value="18:00">06:00 PM</option>
              <option value="19:00">07:00 PM</option>
              <option value="20:00">08:00 PM</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="block w-full px-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-purple focus:border-theme-purple shadow-sm appearance-none transition-all"
          >
            {[1, 2, 3, 4, 5, 6].map((hour) => (
              <option key={hour} value={hour}>
                {hour} {hour === 1 ? 'hour' : 'hours'}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Price per hour</span>
            <span className="font-medium">₹{sport.pricePerHour}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
            <span>Total</span>
            <span className="text-theme-purple">₹{totalPrice}</span>
          </div>
        </div>
        
        <div className="flex space-x-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 px-4 bg-theme-purple text-white rounded-xl hover:bg-indigo-700 focus:outline-none font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
};

export default BookingModal;