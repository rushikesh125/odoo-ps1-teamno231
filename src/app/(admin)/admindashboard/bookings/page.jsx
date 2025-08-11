
import ShowBookings from '@/components/ShowBookings'
import React from 'react'

const ReviewsPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        <div className="text-sm text-gray-500">Manage Customers Bookings</div>
      </div>
      <div className="mt-6">
        <ShowBookings />
      </div>
    </div>
  )
}

export default ReviewsPage