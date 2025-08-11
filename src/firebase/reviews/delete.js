// /firebase/reviews/delete.js
import { doc, deleteDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../config";

export const deleteReview = async (facilityId, reviewId) => {
  const reviewRef = doc(db, "facilities", facilityId, "reviews", reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (reviewSnap.exists()) {
    const { rating } = reviewSnap.data();

    // Delete review
    await deleteDoc(reviewRef);

    // Update facility counts
    const facilityRef = doc(db, "facilities", facilityId);
    await updateDoc(facilityRef, {
      reviewsCount: increment(-1),
      ratingSum: increment(-rating),
    });
  }
};