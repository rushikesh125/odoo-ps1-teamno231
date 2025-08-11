"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useFacility } from "@/firebase/facilities/read_hooks";
import { useUser } from "@/firebase/user/read"; // Assuming this hook exists
import { useAllBookings } from "@/firebase/booking/read";
import { CheckCircle, Clock, Calendar, User, ChevronLeft, ChevronRight, Loader2, Clock4, DollarSign, IndianRupee } from "lucide-react";
import { updateBookingStatus } from "@/firebase/booking/update";

const DEFAULT_ITEMS_PER_PAGE = 10;
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 30];

const BookingStatus = ({ status, bookingId, facilityId }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await updateBookingStatus(facilityId, bookingId, newStatus);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error?.message || "Failed to update booking status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "confirmed"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {status === "confirmed" ? (
          <CheckCircle className="w-4 h-4 inline mr-1" />
        ) : (
          <Clock className="w-4 h-4 inline mr-1" />
        )}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {status === "pending" && (
        <Button
          className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2"
          onPress={() => handleStatusChange("confirmed")}
          isLoading={isUpdating}
        >
          Confirm
        </Button>
      )}
    </div>
  );
};

const BookedFacility = ({ facilityId }) => {
  const { data: facility, isLoading } = useFacility({ facilityId });

  if (isLoading) {
    return (
      <div className="inline-block bg-gray-100 px-2 py-1 rounded-md text-xs">
        <div className="w-20 h-3 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
      <Link href={`/facility/${facilityId}`} className="hover:underline">
        {facility?.name || "Facility"}
      </Link>
    </div>
  );
};

const UserDetails = ({ uid }) => {
  const { data: user, isLoading } = useUser({ uid });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-3 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar url={user?.photoURL || "/user-profile.jpg"} />
      <h4 className="font-semibold text-gray-900">
        {user?.displayName || user?.email || "Anonymous User"}
      </h4>
    </div>
  );
};

const ShowBookings = () => {
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [lastSnapDocStack, setLastSnapDocStack] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentLastSnapDoc = currentPageIndex === 0 ? null : lastSnapDocStack[currentPageIndex - 1];

  const {
    data: bookings,
    error,
    isLoading: isInitialLoading,
    lastSnapDoc: newLastSnapDoc,
  } = useAllBookings({
    pageLimit: itemsPerPage,
    lastSnapDoc: currentLastSnapDoc,
  });

  const handleNextPage = () => {
    if (newLastSnapDoc) {
      setLastSnapDocStack((prev) => [...prev, newLastSnapDoc]);
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setLastSnapDocStack((prev) => prev.slice(0, -1));
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    setLastSnapDocStack([]);
    setCurrentPageIndex(0);
  }, [itemsPerPage]);

  const generateBookingKey = (item) => {
    return `${item.facilityId}-${item.bookingId}`;
  };

  if (isInitialLoading && (!bookings || bookings.length === 0)) {
    return (
      <Card className="w-full">
        <CardBody className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardBody className="text-center py-10">
          <div className="text-red-500 font-medium">Error Occurred</div>
          <p className="text-gray-500 mt-2">Failed to load bookings</p>
          <Button className="mt-4" onPress={() => window.location.reload()}>
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  const hasNextPage = bookings && bookings.length === itemsPerPage && newLastSnapDoc !== null;
  const hasPreviousPage = currentPageIndex > 0;

  return (
    <Card className="w-full shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h2 className="text-xl font-bold">Customer Bookings</h2>
      </CardHeader>

      <CardBody className="p-6">
        {bookings && bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((item, index) => (
              <div
                key={generateBookingKey(item)}
                className="relative flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {index + 1 + currentPageIndex * itemsPerPage}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <BookedFacility facilityId={item?.facilityId} />
                    </div>
                    <BookingStatus
                      status={item?.status || "pending"}
                      bookingId={item?.bookingId}
                      facilityId={item?.facilityId}
                    />
                  </div>

                  <div className="space-y-2">
                    <UserDetails uid={item?.userId} />

                    <div className="text-gray-700 text-sm">
                      Court: {item?.courtName || "N/A"} - {item?.sportName || "N/A"}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-700 text-sm">
                        {item?.date || "No date provided"}
                      </p>
                    </div>

                    {item?.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock4 className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700 text-sm">
                          {item.startTime}
                        </p>
                      </div>
                    )}

                    {item?.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700 text-sm">
                          Duration: {item.duration} hours
                        </p>
                      </div>
                    )}

                    {item?.totalPrice && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-700 text-sm">
                          Price: &#8377; {item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-2">No bookings found</div>
            <p className="text-gray-500">There are no bookings to display</p>
          </div>
        )}

        {bookings && bookings.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Items per page:</span>
              <select
                className="bg-gray-100 rounded-lg outline-none p-2 text-sm border border-gray-200 focus:ring-2 focus:ring-purple-500"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                disabled={isInitialLoading}
              >
                {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                  <option key={num} value={num}>
                    {num} items
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || isInitialLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleNextPage}
                disabled={!hasNextPage || isInitialLoading}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ShowBookings;