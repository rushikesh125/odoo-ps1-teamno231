"use client"
import React from 'react';
import { useSelector } from 'react-redux';
import ShowBookings from '@/components/ShowBookings';
import { Loader2 } from 'lucide-react';
import { useOwnedBookings, useOwnedFacilities } from '@/firebase/booking/read';


const BookingsPage = () => {
  // Get current user UID from Redux state
  const user = useSelector((state) => state.user); // Adjust based on your Redux state structure
  const uid = user?.uid;

  // Fetch facilities owned by the current user
  const { data: facilities, isLoading: facilitiesLoading, error: facilitiesError } = useOwnedFacilities({ ownerId: uid });

  // Extract facility IDs
  const facilityIds = facilities?.map((facility) => facility.id) || [];

  // Fetch bookings for owned facilities
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useOwnedBookings({ facilityIds });

  if (!uid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please sign in to view your bookings.</p>
        </div>
      </div>
    );
  }

  if (facilitiesLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (facilitiesError || bookingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-500">Error loading bookings</p>
          <p className="text-gray-600 mt-2">{facilitiesError || bookingsError}</p>
          <button
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Facility Bookings</h1>
        <ShowBookings bookings={bookings} />
      </div>
    </div>
  );
};

export default BookingsPage;