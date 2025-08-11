// /firebase/reviews/read_hook.js
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../config"
import useSWRSubscription from "swr/subscription";

/**
 * Hook: Get all reviews for a facility (real-time)
 * Ideal for admin panel
 * @param {string} facilityId
 */
export function useReviews(facilityId) {
  const { data, error } = useSWRSubscription(
    ["reviews", facilityId],
    ([key, facilityId], { next }) => {
      if (!facilityId) {
        next(null, []);
        return () => {};
      }

      const reviewsRef = collection(db, "facilities", facilityId, "reviews");
      const q = query(reviewsRef, orderBy("createdAt", "desc"));

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          next(null, reviews);
        },
        (err) => {
          console.error("Failed to fetch reviews:", err);
          next(err, null);
        }
      );

      return () => unsub();
    }
  );

  return {
    reviews: data,
    isLoading: data === undefined && !error,
    error: error?.message,
  };
}