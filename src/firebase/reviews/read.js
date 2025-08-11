// /firebase/reviews/read.js
import { doc, getDoc, collection, getDocs, query, orderBy, collectionGroup, limit, startAfter, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription from "swr/subscription";

/**
 * Get a single review
 */
export const getReview = async (facilityId, reviewId) => {
  const reviewRef = doc(db, "facilities", facilityId, "reviews", reviewId);
  const snapshot = await getDoc(reviewRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

/**
 * Get all reviews for a facility
 */
export const getReviews = async (facilityId) => {
  if (!facilityId) return [];

  const reviewsRef = collection(db, "facilities", facilityId, "reviews");
  const q = query(reviewsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getReviewsCount = async (facilityId) => {
  if (!facilityId) return 0;

  const reviewsRef = collection(db, "facilities", facilityId, "reviews");
  const snapshot = await getDocs(reviewsRef);
  return snapshot.size; // number of documents
};

export const useAllReviews = ({ pageLimit, lastSnapDoc }) => {
  // Subscribe to Firestore collection using SWRSubscription
  const { data, error } = useSWRSubscription(
    ["reviews", pageLimit, lastSnapDoc], // Key to identify this subscription
    ([_, pageLimit, lastSnapDoc], { next }) => {
      // Define Firestore collectionGroup reference
      const ref = collectionGroup(db, "reviews");
      let q = query(ref, limit(pageLimit ?? 10)); // Set the query with pagination limit

      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc)); // Paginate using lastSnapDoc
      }

      // Setup Firestore listener
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null, {
            list:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs.map((snap) => ({
                    id: snap.id,
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

      return () => unsub(); // Clean up listener on unmount
    }
  );

  return {
    data: data?.list || [],
    lastSnapDoc: data?.lastSnapDoc || null,
    error: error?.message || null,
    isLoading: data === undefined,
  };
};
