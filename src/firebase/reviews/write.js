// /firebase/reviews/write.js
import { db } from "../config";
import { doc, setDoc, updateDoc, increment, collection, serverTimestamp } from "firebase/firestore";

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

  // Save review
  await setDoc(newDocRef, review);

  // Update facility aggregate
  const facilityRef = doc(db, "facilities", facilityId);
  await updateDoc(facilityRef, {
    reviewsCount: increment(1),
    ratingSum: increment(review.rating),
  });

  return newDocRef.id;
};