// ShowReviews.jsx
"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { Button } from "@heroui/button";
import { useFacility } from "@/firebase/facilities/read_hooks";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useAllReviews } from "@/firebase/reviews/read";
import { TrashIcon } from "lucide-react";
import { deleteReview } from "@/firebase/reviews/delete";

// Custom Rating Component
const CustomRating = ({ value, max = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < value ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-500">{value}.0</span>
    </div>
  );
};

const ShowReviews = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [lastSnapDocList, setLastSnapDocList] = useState([]);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    setLastSnapDocList([]); // Reset pagination stack when itemsPerPage changes
  }, [itemsPerPage]);

  const {
    data: reviews,
    error,
    isLoading,
    lastSnapDoc,
  } = useAllReviews({
    pageLimit: itemsPerPage,
    lastSnapDoc:
      lastSnapDocList.length === 0
        ? null
        : lastSnapDocList[lastSnapDocList.length - 1],
  });

  const handleNextPage = () => {
    if (lastSnapDoc) {
      setLastSnapDocList((prev) => [...prev, lastSnapDoc]);
    }
  };

  const handlePrePage = () => {
    setLastSnapDocList((prev) => prev.slice(0, -1));
  };

  const handleDeleteReview = async (facilityId, reviewId) => {
    const reviewKey = `${facilityId}-${reviewId}`;
    setIsDeleting(reviewKey);
    
    try {
      if (confirm("Are you sure you want to delete this review?")) {
        await deleteReview(facilityId, reviewId);
        toast.success("Review deleted successfully");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to delete review");
    } finally {
      setIsDeleting(null);
    }
  };

  // Generate unique key for each review
  const generateReviewKey = (item, index) => {
    if (!item?.reviewId || !item?.facilityId) {
      return `review-${index}-${Date.now()}`;
    }
    return `${item.facilityId}-${item.reviewId}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardBody className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardBody className="text-center py-10">
          <div className="text-red-500 font-medium">Error Occurred</div>
          <p className="text-gray-500 mt-2">Failed to load reviews</p>
          <Button 
            className="mt-4" 
            onPress={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-0">
        <h2 className="text-xl font-bold text-gray-800">User Reviews</h2>
      </CardHeader>
      
      <CardBody>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((item, index) => (
              <div
                key={generateReviewKey(item, index)}
                className="relative flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <Button
                  isIconOnly
                  className="absolute top-3 right-3 bg-red-50 hover:bg-red-100 text-red-500 min-w-0 h-8 w-8"
                  onPress={() => handleDeleteReview(item?.facilityId, item?.reviewId)}
                  isLoading={isDeleting === `${item?.facilityId}-${item?.reviewId}`}
                  aria-label="Delete review"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
                
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {index + 1 + lastSnapDocList.length * itemsPerPage}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Avatar url={item?.photoURL || "/user-profile.jpg"} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <ReviewedProduct facilityId={item?.facilityId} />
                  </div>
                  
                  <div className="mb-1">
                    <h4 className="font-semibold text-gray-900">{item?.userName || 'Anonymous User'}</h4>
                    <CustomRating value={item?.rating || 0} />
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-gray-700">{item?.comment || 'No review content'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-2">No reviews found</div>
            <p className="text-gray-500">There are no reviews to display</p>
          </div>
        )}
        
        {reviews && reviews.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-100">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
              onPress={handlePrePage}
              isDisabled={lastSnapDocList.length === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Items per page:</span>
              <select
                className="bg-gray-100 rounded-lg outline-none p-2 text-sm border border-gray-200"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              >
                {[5, 10, 15, 20, 30].map((num) => (
                  <option key={num} value={num}>{num} items</option>
                ))}
              </select>
            </div>
            
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
              onPress={handleNextPage}
              isDisabled={!reviews || reviews.length < itemsPerPage}
            >
              Next
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ShowReviews;

const ReviewedProduct = ({ facilityId }) => {
  const { data: facility, isLoading } = useFacility({ facilityId });

  if (isLoading) {
    return (
      <div className="inline-block bg-gray-100 px-2 py-1 rounded-md text-xs">
        <div className="w-20 h-3 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
      <Link href={`/facility/${facilityId}`} className="hover:underline">
        {facility?.name || 'Facility'}
      </Link>
    </div>
  );
};