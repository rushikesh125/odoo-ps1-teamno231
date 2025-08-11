// /firebase/reviews/read.js
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config";

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