"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star } from "lucide-react";

import NavBar from "@/components/Navbar";
import FacilityCard from "@/components/FacilityCard";
import SportCard from "@/components/SportCard";
import { useFacilities } from "@/firebase/facilities/read_hooks";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: facilities, isLoading, error } = useFacilities({
    pageLimit: 8,
    status: 'approved',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularSports = [
    { name: 'Badminton', icon: '🏸' },
    { name: 'Football', icon: '⚽' },
    { name: 'Cricket', icon: '🏏' },
    { name: 'Swimming', icon: '🏊' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Table Tennis', icon: '🏓' },
    { name: 'Basketball', icon: '🏀' },
    { name: 'Volleyball', icon: '🏐' }
  ];

  const handleSportClick = (sportName) => {
    router.push(`/explore?sport=${encodeURIComponent(sportName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Hero Section with Search */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find & Book Sports Venues
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the best sports facilities in your area and book courts instantly
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="flex shadow-lg rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Search for facilities, sports, or locations..."
                className="flex-grow px-6 py-4 text-gray-900 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-theme-purple hover:bg-indigo-700 text-white px-8 py-4 font-medium transition-colors flex items-center"
              >
                <Search className="mr-2" size={20} />
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Popular Venues</h2>
            <button
              onClick={() => router.push('/explore')}
              className="text-theme-purple hover:text-indigo-700 font-medium flex items-center"
            >
              View All
              <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-purple"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <p className="text-red-700 font-medium">Failed to load facilities. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-theme-purple text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : facilities?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.slice(0, 6).map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No facilities found</h3>
              <p className="mt-1 text-gray-500">We couldn't find any facilities matching your criteria.</p>
            </div>
          )}
        </section>

        {/* Popular Sports Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Popular Sports</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularSports.map((sport) => (
              <SportCard 
                key={sport.name} 
                sport={sport} 
                onClick={() => handleSportClick(sport.name)} 
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
     
    </div>
  );
}