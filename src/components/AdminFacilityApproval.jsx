// /components/AdminFacilityApproval.jsx
"use client";
import React, { useState } from "react";
import { Card, CardBody, CardFooter, Image }  from "@/components/ui/card"
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { CheckCircle, XCircle, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { updateFacilityStatus } from "@/firebase/facilities/update"; // You'll need to implement this

const getStatusColor = (status) => {
  switch (status) {
    case "approved": return "success";
    case "rejected": return "danger";
    case "pending": return "warning";
    default: return "default";
  }
};

const AdminFacilityApproval = ({ facility, onStatusChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await updateFacilityStatus(facility.id, newStatus);
      toast.success(`Facility ${newStatus} successfully`);
      onStatusChange(facility.id, newStatus);
    } catch (error) {
      console.error("Error updating facility status:", error);
      toast.error(`Failed to ${newStatus} facility`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Facility Image */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={facility.photos?.[0] || "/placeholder-facility.jpg"}
                alt={facility.name}
                className="w-full h-full object-cover"
                fallbackSrc="/placeholder-facility.jpg"
              />
            </div>
          </div>

          {/* Facility Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {facility.name}
              </h3>
              <Chip
                className="capitalize"
                color={getStatusColor(facility.status)}
                variant="flat"
                size="sm"
              >
                {facility.status}
              </Chip>
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate">
                {facility.location?.city}, {facility.location?.state}
              </span>
            </div>

            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                Created: {facility.createdAt ? format(new Date(facility.createdAt.toDate()), 'MMM dd, yyyy') : 'N/A'}
              </span>
            </div>

            <div className="mt-2 text-sm text-gray-600 line-clamp-2">
              {facility.description}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {facility.sports?.slice(0, 3).map((sport, index) => (
                <Chip key={index} size="sm" variant="bordered">
                  {sport.name}
                </Chip>
              ))}
              {facility.sports?.length > 3 && (
                <Chip size="sm" variant="bordered">
                  +{facility.sports.length - 3} more
                </Chip>
              )}
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <Button
          as={Link}
          href={`/facility/${facility.id}`}
          target="_blank"
          variant="light"
          size="sm"
        >
          View Details
        </Button>
        
        <div className="flex gap-2">
          <Button
            isIconOnly
            size="sm"
            color="success"
            variant="flat"
            isLoading={isProcessing && facility.actionStatus === 'approve'}
            isDisabled={facility.status === 'approved' || isProcessing}
            onPress={() => handleStatusChange('approved')}
            aria-label="Approve facility"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          
          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="flat"
            isLoading={isProcessing && facility.actionStatus === 'reject'}
            isDisabled={facility.status === 'rejected' || isProcessing}
            onPress={() => handleStatusChange('rejected')}
            aria-label="Reject facility"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminFacilityApproval;