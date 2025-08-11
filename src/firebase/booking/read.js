// read.js
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../config";

// Get a single booking
export const getBooking = async (facilityId, bookingId) => {
  const bookingRef = doc(db, "facilities", facilityId, "bookings", bookingId);
  const snapshot = await getDoc(bookingRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// Get all bookings for a facility
export const getBookingsByFacility = async (facilityId) => {
  const bookingsRef = collection(db, "facilities", facilityId, "bookings");
  const q = query(bookingsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get bookings by user (for user's booking history)
export const getBookingsByUser = async (facilityId, userId) => {
  const bookingsRef = collection(db, "facilities", facilityId, "bookings");
  const q = query(bookingsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get bookings by date & court (for availability check)
export const getBookingsByDateAndCourt = async (facilityId, date, courtId) => {
  const bookingsRef = collection(db, "facilities", facilityId, "bookings");
  const q = query(
    bookingsRef,
    where("date", "==", date),
    where("courtId", "==", courtId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};