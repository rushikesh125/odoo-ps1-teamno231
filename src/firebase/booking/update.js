// update.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config";

export const updateBooking = async (facilityId, bookingId, updateData) => {
  const bookingRef = doc(db, "facilities", facilityId, "bookings", bookingId);
  await updateDoc(bookingRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};