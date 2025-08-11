// update.js
import { doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../config";

export const updateBooking = async (facilityId, bookingId, updateData) => {
  const bookingRef = doc(db, "facilities", facilityId, "bookings", bookingId);
  await updateDoc(bookingRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};


export const updateBookingStatus = async (facilityId, bookingId, newStatus) => {
  try {
    const bookingRef = doc(db, "facilities", facilityId, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: newStatus,
      updatedAt: Timestamp.new(),
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
};