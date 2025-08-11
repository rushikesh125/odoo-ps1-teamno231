// /firebase/reviews/write.js
import { generateRandomId } from "@/lib/constant";
import { db } from "../config";
import { doc, setDoc, updateDoc, increment, collection, serverTimestamp } from "firebase/firestore";
export const createReview = async (facilityId, reviewData) => {
  // Use provided reviewId or generate a new one
  const reviewId = reviewData.reviewId || generateRandomId();
  const reviewRef = doc(db, "facilities", facilityId, "reviews", reviewId);

  const review = {
    reviewId: reviewId,
    userId: reviewData.userId,
    userName: reviewData.userName || "Anonymous",
    rating: Number(reviewData.rating),
    comment: reviewData.comment?.trim() || "No comment",
    facilityId: facilityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Save review
  await setDoc(reviewRef, review);

  // Update facility aggregate
  const facilityRef = doc(db, "facilities", facilityId);
  await updateDoc(facilityRef, {
    reviewsCount: increment(1),
    ratingSum: increment(review.rating),
  });

  return reviewId;
};