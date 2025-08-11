// read.js
import { doc, getDoc, collection, getDocs, query, where, orderBy, collectionGroup, limit, startAfter, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription from "swr/subscription";

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

export const useAllBookings = ({ pageLimit, lastSnapDoc }) => {
  const { data, error } = useSWRSubscription(
    ["bookings", pageLimit, lastSnapDoc],
    ([_, pageLimit, lastSnapDoc], { next }) => {
      const ref = collectionGroup(db, "bookings");
      let q = query(ref, limit(pageLimit ?? 10));

      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null, {
            list:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs.map((snap) => ({
                    bookingId: snap.id,
                    facilityId: snap.ref.parent.parent.id,
                    ...snap.data(),
                  })),
            lastSnapDoc:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs[snapshot.docs.length - 1],
          });
        },
        (err) => next(err, null)
      );

      return () => unsub();
    }
  );
  console.log("All Bookings:",data?.list )
  return {
    data: data?.list || [],
    lastSnapDoc: data?.lastSnapDoc || null,
    error: error?.message || null,
    isLoading: data === undefined,
  };
};