// /app/mybookings/page.jsx
"use client";

import { useState } from "react";
import { useMyBookings } from "@/firebase/booking/read_hook";
import { deleteBooking } from "@/firebase/booking/delete"; // Updated import
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  X, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

const MyBookingsPage = () => {
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const { bookings, isLoading, error, refetch } = useMyBookings();
  const [isCancelling, setIsCancelling] = useState(false); // State for cancellation
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  if (!user) {
    toast.error("Please log in to view your bookings.");
    router.push("/login");
    return null;
  }

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setIsAlertOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setIsCancelling(true);
    try {
      await deleteBooking(bookingToCancel.facilityId, bookingToCancel.id);
      toast.success("Booking cancelled successfully");
      refetch(); // Refresh the bookings list
    } catch (error) {
      toast.error("Failed to cancel booking: " + error.message);
    } finally {
      setIsCancelling(false);
      setIsAlertOpen(false);
      setBookingToCancel(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-theme-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load bookings: " + error.message);
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-6">We couldn't load your bookings at the moment</p>
          <Button 
            onClick={() => router.push("/explore")}
            className="bg-theme-purple hover:bg-theme-purple"
          >
            Explore Facilities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <Badge variant="outline" className="text-lg py-1 px-3">
          {bookings?.length || 0} {bookings?.length === 1 ? 'Booking' : 'Bookings'}
        </Badge>
      </div>

      {bookings?.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-theme-purple/10 flex items-center justify-center mb-6">
            <Users className="h-12 w-12 text-theme-purple" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't booked any courts. Start exploring facilities to make your first booking!
          </p>
          <Button 
            onClick={() => router.push("/explore")}
            className="bg-theme-purple hover:bg-theme-purple text-base py-3 px-6"
          >
            Explore Facilities
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            {bookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="my-5 hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-2xl overflow-hidden"
              >
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-900">{booking.courtName}</CardTitle>
                      <p className="text-theme-purple font-semibold mt-1">{booking.sportName}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        text-sm font-medium px-3 py-1 rounded-full
                        ${booking.status === "confirmed" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : booking.status === "cancelled" 
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"}
                      `}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-3 text-theme-purple" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-3 text-theme-purple" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">
                          {booking.startTime} for {booking.duration} {booking.duration === 1 ? "hour" : "hours"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3 text-theme-purple" />
                      <div>
                        <p className="text-sm text-gray-500">Facility</p>
                        <Link href={`/facility/${booking.facilityId}`} className="font-medium underline text-blue-500 truncate max-w-[200px]">ID: {booking.facilityId}</Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-3 text-theme-purple" />
                      <div>
                        <p className="text-sm text-gray-500">Booking ID</p>
                        <p className="font-mono text-sm font-medium">{booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{booking.totalPrice}</p>
                    </div>
                    {booking.status === "confirmed" && (
                      <Button
                        variant="outline"
                        onClick={() => handleCancelClick(booking)}
                        disabled={isCancelling}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        {isCancelling && bookingToCancel?.id === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to cancel this booking? This action cannot be undone.
              {bookingToCancel && (
                <div className="mt-4 p-4 bg-gray-200 rounded-lg">
                  <p className="font-medium">{bookingToCancel.courtName} - {bookingToCancel.sportName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(bookingToCancel.date).toLocaleDateString()} at {bookingToCancel.startTime}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={isCancelling}
            >
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookingsPage;