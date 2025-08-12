"use client"
import React from 'react';
import { useSelector } from 'react-redux';
import { useOwnedFacilities, useOwnedBookings } from '@/firebase/booking/read';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Loader2, IndianRupee, Calendar, Clock } from 'lucide-react';

// Hook to compute dashboard statistics
const useDashboardStats = ({ bookings }) => {
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Calculate total earnings from confirmed bookings
  const totalEarnings = bookings
    .filter((booking) => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  // Count bookings placed this week
  const weeklyBookings = bookings.filter((booking) => {
    if (!booking.createdAt) return false;
    const bookingDate = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
    return bookingDate >= oneWeekAgo && bookingDate <= today;
  }).length;

  // Count pending bookings
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;

  // Prepare data for earnings chart (daily earnings for the last 7 days)
  const earningsData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dailyEarnings = bookings
      .filter((booking) => {
        if (booking.status !== 'confirmed' || !booking.createdAt) return false;
        const bookingDate = booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
        return bookingDate.toISOString().split('T')[0] === dateString;
      })
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      
    earningsData.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      earnings: dailyEarnings,
    });
  }

  // Prepare data for bookings by status with percentages
  const totalBookings = bookings.length;
  const statusData = [
    { name: 'Confirmed', count: bookings.filter((booking) => booking.status === 'confirmed').length },
    { name: 'Pending', count: pendingBookings },
    { name: 'Rejected', count: bookings.filter((booking) => booking.status === 'rejected').length },
  ].map((item) => ({
    ...item,
    percentage: totalBookings > 0 ? ((item.count / totalBookings) * 100).toFixed(1) : 0,
  }));

  return {
    totalEarnings,
    weeklyBookings,
    pendingBookings,
    earningsChartData: earningsData,
    statusChartData: statusData,
    oneWeekAgo,
    today
  };
};

const OwnerDashboard = () => {
  // Get current user UID from Redux state
  const user = useSelector((state) => state.user); // Adjust based on your Redux state structure
  const uid = user?.uid;

  // Fetch facilities owned by the current user
  const { data: facilities, isLoading: facilitiesLoading, error: facilitiesError } = useOwnedFacilities({ ownerId: uid });

  // Extract facility IDs
  const facilityIds = facilities?.map((facility) => facility.id) || [];

  // Fetch bookings for owned facilities
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useOwnedBookings({ facilityIds });

  // Compute dashboard statistics
  const { 
    totalEarnings, 
    weeklyBookings, 
    pendingBookings, 
    earningsChartData, 
    statusChartData,
    oneWeekAgo,
    today
  } = useDashboardStats({ bookings: bookings || [] });

  if (!uid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (facilitiesLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (facilitiesError || bookingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-500">Error loading dashboard</p>
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

  // Format dates for weekly bookings
  const formattedWeekRange = `${oneWeekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Owner Dashboard</h1>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 flex items-center">
            <IndianRupee className="h-10 w-10 text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Earnings</h3>
              <p className="text-2xl font-bold text-purple-600">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-gray-500">(All Time)</span></p>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 flex items-center">
            <Calendar className="h-10 w-10 text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Bookings</h3>
              <p className="text-2xl font-bold text-purple-600">{weeklyBookings} <span className="text-sm text-gray-500">({formattedWeekRange})</span></p>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 flex items-center">
            <Clock className="h-10 w-10 text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Bookings</h3>
              <p className="text-2xl font-bold text-purple-600">{pendingBookings} <span className="text-sm text-red-500">Action Required</span></p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#8b5cf6"
                  fillOpacity={0.2}
                  fill="#8b5cf6"
                  name="Daily Earnings (₹)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} bookings`, `(${props.payload.percentage}%)`]}
                  labelFormatter={(label) => `Status: ${label}`}
                />
                <Legend />
                <Bar dataKey="count" name="Bookings">
                  {statusChartData.map((entry, index) => (
                    <rect 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Confirmed' ? '#22c55e' : 
                        entry.name === 'Pending' ? '#eab308' : 
                        '#ef4444'
                      }
                    />
                  ))}
                  <LabelList dataKey="percentage" position="top" formatter={(value) => `${value}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;