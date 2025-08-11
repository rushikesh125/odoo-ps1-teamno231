// /firebase/reviews/delete.js
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../config";

/**
 * Deletes a review
 * @param {string} facilityId
 * @param {string} reviewId
 */
export const deleteReview = async (facilityId, reviewId) => {
  const reviewRef = doc(db, "facilities", facilityId, "reviews", reviewId);
  await deleteDoc(reviewRef);
};