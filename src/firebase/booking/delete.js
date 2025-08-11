// delete.js
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config";
export const deleteBooking = async (facilityId, bookingId) => {
  const bookingRef = doc(db, "facilities", facilityId, "bookings", bookingId);
  await deleteDoc(bookingRef);
};