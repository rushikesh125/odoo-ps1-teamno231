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
import { TrashIcon, Star } from "lucide-react";
import { deleteReview } from "@/firebase/reviews/delete";

// Custom Rating Component
const CustomRating = ({ value, max = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600 font-medium">{value}.0</span>
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
    <Card className="w-full shadow-lg rounded-xl overflow-hidden">
      {/* <CardHeader className="text-purple-600  pb-4">
        <h2 className="text-xl font-bold">User Reviews</h2>
      </CardHeader> */}
      
      <CardBody className="p-0">
        {reviews && reviews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {reviews.map((item, index) => (
              <div
                key={generateReviewKey(item, index)}
                className="relative p-5 hover:bg-purple-50 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1 + lastSnapDocList.length * itemsPerPage}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between gap-2 mb-3">
                      <div>
                        <ReviewedProduct facilityId={item?.facilityId} />
                      </div>
                      <Button
                        isIconOnly
                        className="bg-red-50 hover:bg-red-100 text-red-500 min-w-0 h-8 w-8"
                        onPress={() => handleDeleteReview(item?.facilityId, item?.reviewId)}
                        isLoading={isDeleting === `${item?.facilityId}-${item?.reviewId}`}
                        aria-label="Delete review"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar url={item?.photoURL || "/user-profile.jpg"} className="w-10 h-10" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{item?.userName || 'Anonymous User'}</h4>
                        <CustomRating value={item?.rating || 0} />
                      </div>
                    </div>
                    
                    <div className="mt-2 pl-1">
                      <p className="text-gray-700">{item?.comment || 'No review content'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No reviews found</div>
            <p className="text-gray-500">There are no reviews to display</p>
          </div>
        )}
        
        {reviews && reviews.length > 0 && (
          <div className="mt-0 border-t border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded-lg min-w-[120px]"
              onPress={handlePrePage}
              isDisabled={lastSnapDocList.length === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Items per page:</span>
              <select
                className="bg-purple-50 rounded-lg outline-none p-2 text-sm border border-purple-200 focus:ring-2 focus:ring-purple-500"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              >
                {[5, 10, 15, 20, 30].map((num) => (
                  <option key={num} value={num}>{num} items</option>
                ))}
              </select>
            </div>
            
            <Button
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded-lg min-w-[120px]"
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
      <div className="inline-block bg-purple-100 px-2 py-1 rounded-md text-xs">
        <div className="w-20 h-3 bg-purple-200 animate-pulse rounded"></div>
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