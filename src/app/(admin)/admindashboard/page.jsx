'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  Calendar, 
  Star, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalBookings: 0,
    totalReviews: 0,
    weeklyBookings: 0,
    weeklyReviews: 0,
    totalRevenue: 0,
    weeklyRevenue: 0
  });

  const [bookingData, setBookingData] = useState([]);
  const [facilityData, setFacilityData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setStats({
        totalFacilities: 128,
        totalBookings: 1242,
        totalReviews: 864,
        weeklyBookings: 142,
        weeklyReviews: 56,
        totalRevenue: 245600,
        weeklyRevenue: 32450
      });

      setBookingData([
        { day: 'Mon', bookings: 24 },
        { day: 'Tue', bookings: 32 },
        { day: 'Wed', bookings: 28 },
        { day: 'Thu', bookings: 41 },
        { day: 'Fri', bookings: 38 },
        { day: 'Sat', bookings: 52 },
        { day: 'Sun', bookings: 45 }
      ]);

      setFacilityData([
        { name: 'Approved', value: 112 },
        { name: 'Pending', value: 10 },
        { name: 'Rejected', value: 6 }
      ]);

      setRecentActivity([
        { id: 1, user: 'Alex Johnson', action: 'Booked Tennis Court', time: '2 hours ago', type: 'booking' },
        { id: 2, user: 'Sarah Miller', action: 'Reviewed Basketball Facility', time: '4 hours ago', type: 'review' },
        { id: 3, user: 'Mike Thompson', action: 'New Facility Added', time: '1 day ago', type: 'facility' },
        { id: 4, user: 'Emma Davis', action: 'Booking Cancelled', time: '1 day ago', type: 'cancel' }
      ]);

      setLoading(false);
    }, 800);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Stat card component
  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-indigo-50">
          <Icon className="h-6 w-6 text-theme-purple" />
        </div>
      </div>
      {change && (
        <div className={`mt-3 flex items-center text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-4 w-4 ${changeType === 'positive' ? '' : 'rotate-180'}`} />
          <span className="ml-1">{change} from last week</span>
        </div>
      )}
    </div>
  );

  // Recent activity item
  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      switch(type) {
        case 'booking': return <Calendar className="h-4 w-4 text-blue-500" />;
        case 'review': return <Star className="h-4 w-4 text-yellow-500" />;
        case 'facility': return <MapPin className="h-4 w-4 text-green-500" />;
        case 'cancel': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return <Activity className="h-4 w-4 text-gray-500" />;
      }
    };

    const getBgColor = (type) => {
      switch(type) {
        case 'booking': return 'bg-blue-50';
        case 'review': return 'bg-yellow-50';
        case 'facility': return 'bg-green-50';
        case 'cancel': return 'bg-red-50';
        default: return 'bg-gray-50';
      }
    };

    return (
      <div className="flex items-start py-3">
        <div className={`p-2 rounded-lg ${getBgColor(activity.type)}`}>
          {getIcon(activity.type)}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{activity.user}</p>
          <p className="text-sm text-gray-500">{activity.action}</p>
        </div>
        <div className="ml-auto text-sm text-gray-400">
          {activity.time}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Total Facilities" 
          value={stats.totalFacilities} 
          icon={MapPin}
          change="+12%"
          changeType="positive"
        />
        <StatCard 
          title="Weekly Bookings" 
          value={stats.weeklyBookings} 
          icon={Calendar}
          change="+8%"
          changeType="positive"
        />
        <StatCard 
          title="Weekly Reviews" 
          value={stats.weeklyReviews} 
          icon={Star}
          change="+3%"
          changeType="positive"
        />
        <StatCard 
          title="Weekly Revenue" 
          value={formatCurrency(stats.weeklyRevenue)} 
          icon={DollarSign}
          change="+15%"
          changeType="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bookings Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Bookings</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="bookings" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                >
                  {bookingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === bookingData.length - 1 ? '#4f46e5' : '#c7d2fe'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facilities Status Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Status</h3>
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={facilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {facilityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#10b981' : 
                        index === 1 ? '#f59e0b' : 
                        '#ef4444'
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm font-medium text-theme-purple hover:text-theme-purple">
            View all
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;