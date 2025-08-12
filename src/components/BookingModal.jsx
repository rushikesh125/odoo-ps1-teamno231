"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, CreditCard, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Import Firebase booking functions
import { createBooking } from "@/firebase/booking/write";
import { getBookingsByDateAndCourt } from "@/firebase/booking/read";

const BookingModal = ({ facility, sport, court, onClose, user }) => {
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    if (!bookingDate || !bookingTime) {
      toast.error("Please select date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🔍 Step 1: Check for existing bookings on the same court & date
      const existingBookings = await getBookingsByDateAndCourt(
        facility.id,
        bookingDate,
        court.id
      );

      const requestedStartHour = parseInt(bookingTime.split(":")[0]);
      const requestedEndHour = requestedStartHour + duration;

      const isConflict = existingBookings.some((booking) => {
        const startHour = parseInt(booking.startTime.split(":")[0]);
        const endHour = startHour + booking.duration;

        // Check for overlap
        return (
          (requestedStartHour >= startHour && requestedStartHour < endHour) ||
          (requestedEndHour > startHour && requestedEndHour <= endHour) ||
          (requestedStartHour <= startHour && requestedEndHour >= endHour)
        );
      });

      if (isConflict) {
        toast.error("This time slot is already booked. Please choose another.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Step 2: Create the booking
      const totalPrice = sport.pricePerHour * duration;

      const bookingData = {
        userId: user.uid,
        facilityId: facility.id,
        sportName: sport.name,
        courtId: court.id,
        courtName: court.name,
        date: bookingDate,
        startTime: bookingTime,
        duration,
        totalPrice,
        status: "pending",
      };

      await createBooking(facility.id, bookingData);

      toast.success("✅ Booking Done!");
      onClose();
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("❌ Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!facility || !sport || !court) return null;

  const totalPrice = sport.pricePerHour * duration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book Court</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Facility & Court Info */}
          <div className="mb-6 p-5 bg-gradient-to-r from-theme-purple/10 to-purple-50 rounded-xl border border-theme-purple/20">
            <h3 className="font-bold text-lg text-gray-900">{facility.name}</h3>
            <p className="text-gray-700 font-medium">
              {court.name} • {sport.name}
            </p>
            <div className="mt-3 flex items-center">
              <span className="text-xl font-bold text-theme-purple">
                ₹{sport.pricePerHour}
                <span className="text-sm font-normal text-gray-600">/hr</span>
              </span>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Booking Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-theme-purple" />
                </div>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-purple focus:border-theme-purple shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-theme-purple" />
                </div>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-purple focus:border-theme-purple shadow-sm appearance-none transition-all"
                  required
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = 8 + i; // 8 AM to 8 PM
                    const displayHour = hour > 12 ? hour - 12 : hour;
                    const period = hour >= 12 ? "PM" : "AM";
                    const value = `${hour.toString().padStart(2, "0")}:00`;
                    const label = `${displayHour}:00 ${period}`;
                    return (
                      <option key={hour} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="block w-full px-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-purple focus:border-theme-purple shadow-sm appearance-none transition-all"
              >
                {Array.from({ length: 6 }, (_, i) => i + 1).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} {hour === 1 ? "hour" : "hours"}
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-gray-600">Price per hour</span>
                <span>₹{sport.pricePerHour}</span>
              </div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-gray-600">Duration</span>
                <span>{duration} {duration === 1 ? "hour" : "hours"}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span className="text-theme-purple">₹{totalPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 bg-theme-purple text-white rounded-xl hover:bg-theme-purple font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;