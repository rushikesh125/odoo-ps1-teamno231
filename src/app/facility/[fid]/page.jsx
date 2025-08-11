"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Phone,
  Mail,
  Navigation,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Components
import NavBar from "@/components/Navbar";
import FacilityImageGallery from "@/components/FacilityImageGallery";
import SportScheduleCard from "@/components/SportScheduleCard";
import CourtCard from "@/components/CourtCard";
import BookingModal from "@/components/BookingModal";
import AddReview from "@/components/AddReview";

// Firebase hooks
import { useFacility } from "@/firebase/facilities/read_hooks";
import { useReviews } from "@/firebase/reviews/read_hook";

const FacilityDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const facilityId = params.fid;

  // Fetch facility and reviews separately
  const { data: facility, isLoading: facilityLoading, error: facilityError } = useFacility({ facilityId });
  const { reviews, isLoading: reviewsLoading } = useReviews(facilityId);

  const [selectedSport, setSelectedSport] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);

  // Set default sport
  useState(() => {
    if (facility?.sports?.length > 0 && !selectedSport) {
      setSelectedSport(facility.sports[0]);
    }
  }, [facility, selectedSport]);

  // Handle booking
  const handleBookCourt = (court) => {
    if (!user) {
      toast.error("Please log in to book a court");
      return router.push("/login");
    }
    setSelectedCourt(court);
    setIsBookingModalOpen(true);
  };

  const handleViewMap = () => {
    if (facility?.location?.mapLink) {
      window.open(facility.location.mapLink, "_blank");
    } else {
      toast.error("Map link not available");
    }
  };

  // Loading state
  if (facilityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin h-12 w-12 border-4 border-theme-purple border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (facilityError || !facility) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-lg mx-auto px-4 py-24">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M6.938 16h10.124c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium">Facility Not Found</h3>
            <p className="mt-1 text-gray-500">This facility doesn't exist or was removed.</p>
            <button
              onClick={() => router.push("/explore")}
              className="mt-4 px-4 py-2 bg-theme-purple text-white rounded hover:bg-indigo-700"
            >
              Browse Facilities
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average rating from actual reviews
  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm mb-6">
          <a href="/" className="text-gray-600 hover:text-theme-purple transition-colors">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <a href="/explore" className="text-gray-600 hover:text-theme-purple transition-colors">Facilities</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-500">{facility.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <FacilityImageGallery images={facility.photos || []} />

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{facility.name}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin size={18} className="mr-2 text-theme-purple" />
                  <span className="text-sm md:text-base">
                    {facility.location?.address}, {facility.location?.city}, {facility.location?.state}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={18} />
                    <span className="font-medium">{averageRating}</span>
                    <span className="text-gray-500 text-sm">({reviews?.length || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={18} className="text-theme-purple" />
                    <span className="text-gray-600 text-sm">{facility.sports?.length} Sports</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={18} className="text-theme-purple" />
                    <span className="text-gray-600 text-sm">Open Now</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 self-start">
                <button
                  onClick={handleViewMap}
                  className="flex items-center justify-center px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <Navigation size={18} className="mr-2 text-theme-purple" />
                  <span className="font-medium">View on Map</span>
                </button>
                <button
                  onClick={() => router.push(`/contact?facility=${facilityId}`)}
                  className="flex items-center justify-center px-5 py-3 bg-theme-purple text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-theme-purple focus:ring-opacity-50"
                >
                  <Mail size={18} className="mr-2" />
                  <span className="font-medium">Contact</span>
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{facility.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {facility.amenities?.map((a, i) => (
                <span key={i} className="px-4 py-2 text-sm bg-theme-purple/10 text-theme-purple rounded-full">
                  {a}
                </span>
              ))}
            </div>

            {/* Embedded Google Map */}
            <div className="w-full mt-4 bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative w-full h-0 pb-[56.25%]">
                <iframe
                  src={facility?.location?.mapLink}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Facility Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Sports & Courts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Sports</h2>

              <div className="flex flex-wrap gap-3 mb-6">
                {facility.sports?.map((sport) => (
                  <button
                    key={sport.name}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-5 py-3 rounded-xl font-medium transition-all ${
                      selectedSport?.name === sport.name
                        ? "bg-theme-purple text-white shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {sport.name}
                  </button>
                ))}
              </div>

              {selectedSport && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedSport.name} Courts
                  </h3>

                  {selectedSport.courts?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {selectedSport.courts.map((court) => (
                        <CourtCard
                          key={court.id}
                          court={court}
                          sport={selectedSport}
                          onBook={() => handleBookCourt(court)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-6 text-center">
                      No courts available for {selectedSport.name}
                    </p>
                  )}

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedSport.name} Schedule
                  </h3>
                  <SportScheduleCard schedule={selectedSport.weeklySchedule} />
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>

            {selectedSport ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport:</span>
                  <span className="font-medium">{selectedSport.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per hour:</span>
                  <span className="font-medium">₹{selectedSport.pricePerHour}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{selectedSport.pricePerHour}/hr</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full mt-6 py-4 bg-theme-purple text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Book Now
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Select a sport to see booking details</p>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone size={18} className="text-theme-purple mr-3" />
                  <span>{facility.contactPhone || "Not available"}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={18} className="text-theme-purple mr-3" />
                  <span>{facility.contactEmail || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-current" size={20} />
              <span className="font-medium">{averageRating}</span>
              <span className="text-gray-500 ml-1">({reviews?.length || 0} reviews)</span>
            </div>
          </div>

          {/* Loading */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-theme-purple" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-theme-purple/20 rounded-full flex items-center justify-center">
                      <User className="text-theme-purple" size={16} />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium">{review.userName || "User"}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-gray-500">
                          {review.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}

              {reviews.length > 3 && (
                <button className="text-theme-purple text-sm font-medium hover:underline">
                  See all {reviews.length} reviews
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2">No reviews yet. Be the first!</p>
            </div>
          )}

          {/* Add Review Form */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
            <AddReview facilityId={facilityId} user={user} />
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          facility={facility}
          sport={selectedSport}
          court={selectedCourt}
          onClose={() => setIsBookingModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default FacilityDetailPage;