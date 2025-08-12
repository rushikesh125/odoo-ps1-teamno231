"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useFacility } from "@/firebase/facilities/read_hooks";
import { useUser } from "@/firebase/user/read";
import { useAllBookings } from "@/firebase/booking/read";
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Clock4, 
  IndianRupee,
  CircleDot
} from "lucide-react";
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

  const statusConfig = {
    confirmed: {
      icon: CheckCircle,
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      label: "Confirmed"
    },
    rejected: {
      icon: Clock,
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      label: "Rejected"
    },
    pending: {
      icon: CircleDot,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      label: "Pending"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${config.bgColor} ${config.textColor}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
      {status === "pending" && (
        <div className="flex gap-1">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 min-w-[70px]"
            onPress={() => handleStatusChange("confirmed")}
            isLoading={isUpdating}
            size="sm"
          >
            Confirm
          </Button>
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-2 min-w-[70px]"
            onPress={() => handleStatusChange("rejected")}
            isLoading={isUpdating}
            size="sm"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

const BookedFacility = ({ facilityId }) => {
  const { data: facility, isLoading } = useFacility({ facilityId });

  if (isLoading) {
    return (
      <div className="inline-block bg-purple-100 px-2 py-1 rounded-md text-xs">
        <div className="w-20 h-3 bg-purple-200 animate-pulse rounded"></div>
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
        <div className="w-8 h-8 bg-purple-200 rounded-full animate-pulse"></div>
        <div className="w-24 h-3 bg-purple-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar url={user?.photoURL || "/user-profile.jpg"} className="w-8 h-8" />
      <div className="font-medium text-gray-900 text-sm">
        {user?.displayName || user?.email || "Anonymous User"}
      </div>
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
      <CardHeader className="bg-purple-600 text-white">
        <h2 className="text-xl font-bold">Customer Bookings</h2>
      </CardHeader>

      <CardBody className="p-0">
        {bookings && bookings.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {bookings.map((item, index) => (
              <div
                key={generateBookingKey(item)}
                className="p-4 hover:bg-purple-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1 + currentPageIndex * itemsPerPage}
                    </div>
                    <BookedFacility facilityId={item?.facilityId} />
                  </div>
                  <BookingStatus
                    status={item?.status || "pending"}
                    bookingId={item?.bookingId}
                    facilityId={item?.facilityId}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <UserDetails uid={item?.userId} />
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        Court: {item?.courtName || "N/A"} - {item?.sportName || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        {item?.date || "No date provided"}
                      </span>
                    </div>

                    {item?.startTime && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock4 className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">
                          {item.startTime}
                        </span>
                      </div>
                    )}

                    {item?.duration && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">
                          Duration: {item.duration} hours
                        </span>
                      </div>
                    )}

                    {item?.totalPrice && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <IndianRupee className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">
                          &#8377; {item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No bookings found</div>
            <p className="text-gray-500">There are no bookings to display</p>
          </div>
        )}

        {bookings && bookings.length > 0 && (
          <div className="mt-0 border-t border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Items per page:</span>
              <select
                className="bg-purple-50 rounded-lg outline-none p-2 text-sm border border-purple-200 focus:ring-2 focus:ring-purple-500"
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
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || isInitialLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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