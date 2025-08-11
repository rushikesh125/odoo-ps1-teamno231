// write.js
import { collection, doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../config";

export const createBooking = async (facilityId, bookingData) => {
  const bookingsRef = collection(db, "facilities", facilityId, "bookings");
  const newDocRef = doc(bookingsRef); // auto-generated ID

  const booking = {
    ...bookingData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(newDocRef, booking);
  return newDocRef.id; // return generated booking ID
};