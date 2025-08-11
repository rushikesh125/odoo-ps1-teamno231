// /firebase/booking/hooks.js
import {
  collectionGroup,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription from "swr/subscription";
import { useSelector } from "react-redux";

/**
 * Hook: Get all bookings for the logged-in user (real-time)
 */
export function useMyBookings() {
  const user = useSelector((state) => state.user);
  const userId = user?.id || user?.uid;

  const { data, error } = useSWRSubscription(
    ["my-bookings", userId],
    ([, userId], { next }) => {
      if (!userId) {
        next(null, []);
        return () => {};
      }

      const q = query(
        collectionGroup(db, "bookings"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const bookings = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              facilityId: docSnap.ref.parent.parent.id,
            };
          });
          next(null, bookings); // ✅ moved outside map
        },
        (err) => {
          console.error("Failed to fetch my bookings:", err);
          next(err, null);
        }
      );

      return () => unsub();
    }
  );

  return {
    bookings: data,
    isLoading: data === undefined && !error,
    error: error?.message,
  };
}

/**
 * Hook: Get a single booking by facilityId and bookingId
 */
export function useBooking({ facilityId, bookingId }) {
  const { data, error } = useSWRSubscription(
    ["booking", facilityId, bookingId],
    ([, facilityId, bookingId], { next }) => {
      if (!facilityId || !bookingId) {
        next(null, null);
        return () => {};
      }

      const ref = doc(db, "facilities", facilityId, "bookings", bookingId);

      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            next(null, {
              id: snapshot.id,
              ...snapshot.data(),
            });
          } else {
            next(null, null);
          }
        },
        (err) => {
          console.error("Failed to fetch booking:", err);
          next(err, null);
        }
      );

      return () => unsub();
    }
  );

  return {
    booking: data,
    isLoading: data === undefined && !error,
    error: error?.message,
  };
}
