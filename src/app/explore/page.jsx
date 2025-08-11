// /app/explore/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { useFacilities } from "@/firebase/facilities/read_hooks";
import FacilityCard from "@/components/FacilityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    Filter,
    X,
    Loader2,
    MapPin,
    Star,
    IndianRupee
} from "lucide-react";
import { toast } from "react-hot-toast";
import NavBar from "@/components/Navbar";

const ExplorePage = () => {
    // State management
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [selectedSports, setSelectedSports] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [lastSnapDoc, setLastSnapDoc] = useState(null);
    const [allFacilities, setAllFacilities] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    // Get query parameters
    const searchParams = useSearchParams();

    // Handle query parameter for sport
    useEffect(() => {
        const sportFromQuery = searchParams.get("sport");
        if (sportFromQuery) {
            // Ensure the sport is valid (exists in availableSports)
            const validSport = availableSports.find(
                (sport) => sport.toLowerCase() === sportFromQuery.toLowerCase()
            );
            if (validSport && !selectedSports.includes(validSport)) {
                setSelectedSports([validSport]);
            }
        }
    }, [searchParams]); // Run when searchParams change

    // Handle query parameter for search query (q)
    useEffect(() => {
        const queryFromUrl = searchParams.get("q");
        if (queryFromUrl && queryFromUrl !== searchQuery) {
            setSearchQuery(queryFromUrl);
        }
    }, [searchParams]); // Run when searchParams change

    // Fetch facilities
    const { data: facilities, isLoading, error } = useFacilities({
        pageLimit: 12,
        lastSnapDoc,
        status: "approved"
    });

    // Available sports for filtering
    const availableSports = [
        "Badminton", "Tennis", "Football", "Basketball",
        "Cricket", "Swimming", "Table Tennis", "Volleyball"
    ];

    // Handle initial data load
    useEffect(() => {
        if (facilities) {
            if (lastSnapDoc) {
                // Append new data for pagination
                setAllFacilities(prev => [...prev, ...facilities]);
            } else {
                // Initial load
                setAllFacilities(facilities);
            }

            // Check if we have more data
            setHasMore(facilities.length === 12);
        }
    }, [facilities, lastSnapDoc]);

    // Filter facilities based on criteria
    const filteredFacilities = useMemo(() => {
        if (!allFacilities) return [];

        return allFacilities.filter(facility => {
            // Search query filter
            if (searchQuery && !facility.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Price range filter
            const minPrice = facility.sports?.[0]?.pricePerHour || 0;
            if (minPrice < priceRange[0] || minPrice > priceRange[1]) {
                return false;
            }

            // Sports filter
            if (selectedSports.length > 0) {
                const facilitySports = facility.sports?.map(s => s.name) || [];
                if (!selectedSports.some(sport => facilitySports.includes(sport))) {
                    return false;
                }
            }

            // Rating filter (mock implementation)
            const averageRating = (Math.random() * 2 + 3); // Random between 3-5
            if (averageRating < minRating) {
                return false;
            }

            return true;
        });
    }, [allFacilities, searchQuery, priceRange, selectedSports, minRating]);

    // Handle load more
    const loadMore = () => {
        if (hasMore && facilities?.length > 0) {
            setLastSnapDoc(facilities[facilities.length - 1]);
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery("");
        setPriceRange([0, 5000]);
        setSelectedSports([]);
        setMinRating(0);
    };

    // Handle sport selection
    const toggleSport = (sport) => {
        setSelectedSports(prev =>
            prev.includes(sport)
                ? prev.filter(s => s !== sport)
                : [...prev, sport]
        );
    };

    // Handle error
    if (error) {
        toast.error("Failed to load facilities: " + error);
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Facilities</h3>
                    <p className="text-gray-600 mb-6">We couldn't load facilities at the moment</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 py-25">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Facilities</h1>
                    <p className="text-gray-600">Find the perfect sports facility for your needs</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search facilities by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 text-lg rounded-xl border-gray-300 focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Hidden on mobile by default */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80`}>
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="text-theme-purple hover:text-indigo-700"
                                >
                                    Reset
                                </Button>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <IndianRupee className="h-4 w-4 mr-2 text-theme-purple" />
                                    Price Range
                                </h3>
                                <div className="px-2">
                                    <Slider
                                        min={0}
                                        max={5000}
                                        step={100}
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="mb-4 [&>span]:bg-purple-500 rounded-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>₹{priceRange[0]}</span>
                                        <span>₹{priceRange[1]}+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sports Filter */}
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-900 mb-4">Sports</h3>
                                <div className="space-y-3">
                                    {availableSports.map((sport) => (
                                        <div key={sport} className="flex items-center">
                                            <Checkbox
                                                id={sport}
                                                checked={selectedSports.includes(sport)}
                                                onCheckedChange={() => toggleSport(sport)}
                                                className="border-gray-300 data-[state=checked]:bg-theme-purple data-[state=checked]:border-theme-purple"
                                            />
                                            <label
                                                htmlFor={sport}
                                                className="ml-3 text-sm font-medium text-gray-700"
                                            >
                                                {sport}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <Star className="h-4 w-4 mr-2 text-theme-purple fill-current" />
                                    Minimum Rating
                                </h3>
                                <div className="flex items-center space-x-2">
                                    {[0, 3, 4, 4.5].map((rating) => (
                                        <Button
                                            key={rating}
                                            variant={minRating === rating ? "default" : "outline"}
                                            onClick={() => setMinRating(rating)}
                                            className={`px-3 py-2 rounded-lg ${minRating === rating
                                                    ? "bg-theme-purple text-white"
                                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {rating === 0 ? "Any" : `${rating}+`}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden mb-6">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className="w-full py-3"
                            >
                                <Filter className="h-5 w-5 mr-2" />
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </Button>
                        </div>

                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                Showing {filteredFacilities.length} {filteredFacilities.length === 1 ? 'facility' : 'facilities'}
                            </p>
                            {selectedSports.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSports.map(sport => (
                                        <span
                                            key={sport}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-theme-purple/10 text-theme-purple"
                                        >
                                            {sport}
                                            <button
                                                onClick={() => toggleSport(sport)}
                                                className="ml-2 hover:bg-theme-purple/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Facilities Grid */}
                        {filteredFacilities.length === 0 && !isLoading ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <MapPin className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No facilities found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                                <Button onClick={resetFilters} className="bg-theme-purple hover:bg-indigo-700">
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredFacilities.map((facility) => (
                                        <FacilityCard key={facility.id} facility={facility} />
                                    ))}
                                </div>

                                {/* Load More Button */}
                                <div className="mt-12 flex justify-center">
                                    {isLoading && lastSnapDoc ? (
                                        <Button disabled className="bg-theme-purple">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </Button>
                                    ) : hasMore ? (
                                        <Button
                                            onClick={loadMore}
                                            variant="outline"
                                            className="border-theme-purple text-theme-purple hover:bg-theme-purple/10"
                                        >
                                            Load More
                                        </Button>
                                    ) : (
                                        <p className="text-gray-500">You've reached the end</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExplorePage;