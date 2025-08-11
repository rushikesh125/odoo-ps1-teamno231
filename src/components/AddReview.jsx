// /components/AddReview.jsx
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

// Firebase review function
import { createReview } from "@/firebase/reviews/write";

// Icons
import { Star, User } from "lucide-react";

const AddReview = ({ facilityId,user }) => {
  const [rating, setRating] = useState(5); // default 5 stars
  const [reviewMsg, setReviewMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate user
      if (!user || !user.uid) {
        throw new Error("Please log in to submit a review.");
      }

      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Please give a valid rating.");
      }
      if (!reviewMsg || reviewMsg.trim().length < 3) {
        throw new Error("Review must be at least 3 characters long.");
      }

      // Prepare review data
      const reviewData = {
        userId: user.id || user.uid,
        userName: user.name || user.displayName || "Anonymous User",
        rating,
        comment: reviewMsg.trim(),
        // createReview will add timestamps
      };

      // Create review in Firestore
      await createReview(facilityId, reviewData);

      toast.success(" Review submitted successfully!");
      // Reset form
      setReviewMsg("");
      setRating(5);
    } catch (error) {
      console.error("Review submission failed:", error);
      toast.error(error.message || "Failed to submit review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 max-w-md mx-auto bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 transition-transform hover:scale-110 ${
                star <= rating ? "text-yellow-500" : "text-gray-300"
              }`}
              disabled={isLoading}
            >
              <Star
                className={`h-6 w-6 ${star <= rating ? "fill-current" : ""}`}
                aria-label={`${star} stars`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={reviewMsg}
          onChange={(e) => setReviewMsg(e.target.value)}
          placeholder="Share your experience..."
          maxLength={500}
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="text-right text-sm text-gray-500 mt-1">
          {reviewMsg.length}/500
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-2.5 bg-theme-purple text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>

      {/* Anonymous fallback UI */}
      {!user && (
        <p className="text-sm text-red-500 mt-4 text-center">
          Please log in to leave a review.
        </p>
      )}
    </div>
  );
};

export default AddReview;