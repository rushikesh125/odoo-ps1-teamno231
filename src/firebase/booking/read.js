// read.js
import { doc, getDoc, collection, getDocs, query, where, orderBy, collectionGroup, limit, startAfter, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription from "swr/subscription";
import { getFacilitiesByOwnerId } from "../facilities/read";

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

export const getBookingsForOwner = async (ownerId) => {
  try {
    // First get all facilities owned by this user
    const facilities = await getFacilitiesByOwnerId(ownerId);
    const facilityIds = facilities.map(facility => facility.id);
    
    if (facilityIds.length === 0) {
      return [];
    }

    // Get all bookings for these facilities
    const bookings = [];
    
    for (const facilityId of facilityIds) {
      const bookingsRef = collection(db, 'facilities', facilityId, 'bookings');
      const bookingsQuery = query(bookingsRef, orderBy('createdAt', 'desc'));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      bookingsSnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          facilityId,
          ...doc.data()
        });
      });
    }
    console.log("owner bookings",bookings)
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Get booking details with facility and user info
export const getBookingDetails = async (facilityId, bookingId) => {
  try {
    // Get booking data
    const bookingRef = doc(db, 'facilities', facilityId, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingDoc.data();
    
    // Get facility data
    const facilityRef = doc(db, 'facilities', facilityId);
    const facilityDoc = await getDoc(facilityRef);
    const facilityData = facilityDoc.exists() ? facilityDoc.data() : null;
    
    // Get user data (assuming user ID is stored in booking)
    const userRef = doc(db, 'users', bookingData.userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return {
      id: bookingDoc.id,
      ...bookingData,
      facility: facilityData,
      user: userData
    };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

export function useOwnedFacilities({ ownerId }) {
  const { data, error } = useSWRSubscription(
    ['facilities', ownerId],
    ([path, ownerId], { next }) => {
      if (!ownerId) {
        next(null, []);
        return () => {};
      }
      const ref = query(collection(db, 'facilities'), where('ownerId', '==', ownerId));
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          const facilities = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          next(null, facilities);
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );
console.log("Owned Facilities:", data);
  return {
    data: data || [],
    error: error?.message,
    isLoading: data === undefined,
  };
}

// Hook to fetch bookings for a list of facility IDs
export function useOwnedBookings({ facilityIds }) {
  const { data, error } = useSWRSubscription(
    ['bookings', facilityIds],
    ([path, facilityIds], { next }) => {
      if (!facilityIds || facilityIds.length === 0) {
        next(null, []);
        return () => {};
      }

      const bookings = [];
      const unsubs = facilityIds.map((facilityId) => {
        const ref = collection(db, `facilities/${facilityId}/bookings`);
        return onSnapshot(
          ref,
          (snapshot) => {
            const facilityBookings = snapshot.docs.map((doc) => ({
              id: doc.id,
              facilityId,
              ...doc.data(),
            }));
            // Update bookings array and trigger next with the combined bookings
            bookings.length = 0; // Clear previous bookings
            bookings.push(...facilityBookings);
            next(null, [...bookings]); // Spread to ensure a new array
          },
          (err) => next(err, null)
        );
      });

      return () => unsubs.forEach((unsub) => unsub());
    }
  );
console.log("Owned Bookings",data)
  return {
    data: data || [],
    error: error?.message,
    isLoading: data === undefined,
  };
}