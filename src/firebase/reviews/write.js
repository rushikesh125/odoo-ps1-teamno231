// /firebase/reviews/write.js
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config";
/**
 * Creates a new review for a facility
 * @param {string} facilityId
 * @param {object} reviewData - { userId, userName, rating, comment }
 * @returns {Promise<string>} - reviewId
 */
export const createReview = async (facilityId, reviewData) => {
  const reviewsRef = collection(db, "facilities", facilityId, "reviews");
  const newDocRef = doc(reviewsRef);

  const review = {
    userId: reviewData.userId,
    userName: reviewData.userName || "Anonymous",
    rating: Number(reviewData.rating),
    comment: reviewData.comment?.trim() || "No comment",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newDocRef, review);
  return newDocRef.id;
};