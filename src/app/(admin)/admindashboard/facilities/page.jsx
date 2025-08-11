// app/admindashboard/facilities/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAllFacilities } from '@/firebase/facilities/read_admin'; // Ensure this path is correct
import { updateFacilityStatus } from '@/firebase/facilities/update'; // Ensure this path is correct
import { toast } from 'react-hot-toast';
// Import icons from lucide-react
import { Edit, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, EyeIcon } from 'lucide-react';

const DEFAULT_ITEMS_PER_PAGE = 10;
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 30];

const AdminFacilitiesPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [lastSnapDocStack, setLastSnapDocStack] = useState([]); // Stack of cursors for previous pages
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Index of the current page in the stack
  const [isUpdatingStatus, setIsUpdatingStatus] = useState({}); // Track status update loading per facility

  // Calculate the lastSnapDoc to use for the current query
  const currentLastSnapDoc = currentPageIndex === 0 ? null : lastSnapDocStack[currentPageIndex - 1];

  const {
     data: facilities, // Renamed for clarity
    lastSnapDoc: newLastSnapDoc, // Cursor for the *next* page
    error,
    isLoading: isInitialLoading,
  } = useAllFacilities({ pageLimit: itemsPerPage, lastSnapDoc: currentLastSnapDoc });


  // --- Pagination Logic ---
  const handleNextPage = () => {
    if (newLastSnapDoc) {
      // Push the cursor for the next page onto the stack
      setLastSnapDocStack(prev => [...prev, newLastSnapDoc]);
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      // Pop the last cursor off the stack
      setLastSnapDocStack(prev => prev.slice(0, -1));
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  // Reset pagination when itemsPerPage changes
  useEffect(() => {
    setLastSnapDocStack([]);
    setCurrentPageIndex(0);
    // Note: Changing state inside an effect that depends on that state can be tricky.
    // React batches state updates, so this should work correctly.
  }, [itemsPerPage]);

  // --- End Pagination Logic ---

  const handleStatusChange = async (facilityId, newStatus) => {
    // Prevent action spam
    if (isUpdatingStatus[facilityId]) return;

    // Prevent action if already in that status or if loading initial data
    // Note: We don't have access to the full facility object here easily, so we skip the status check
    // The button disabled state partially handles this.
    if (isInitialLoading) {
        return;
    }

    setIsUpdatingStatus(prev => ({ ...prev, [facilityId]: true }));
    try {
      await updateFacilityStatus(facilityId, newStatus); // Ensure this function exists and works
      toast.success(`Facility ${newStatus} successfully!`);
      // Note: The SWR hook should automatically update the data due to the listener.
      // If you want instant UI update before Firestore confirms, you'd need to update local state here.
      // However, with real-time listeners, it's often better to let SWR handle it.
    } catch (err) {
      console.error('Error updating facility status:', err);
      toast.error('Failed to update facility status.');
    } finally {
       setIsUpdatingStatus(prev => {
            const newState = { ...prev };
            delete newState[facilityId]; // Remove the flag for this facility
            return newState;
        });
    }
  };

  // Handle initial loading state
  if (isInitialLoading && (!facilities || facilities.length === 0)) { // Show loading if no data yet
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-theme-purple mx-auto" />
          <p className="mt-4 text-gray-600">Loading facilities...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Determine if there's a next page (based on the data returned and page limit)
  const hasNextPage = facilities && facilities.length === itemsPerPage && newLastSnapDoc !== null;
  const hasPreviousPage = currentPageIndex > 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-theme-purple to-indigo-600 px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Manage Facilities</h1>
            <p className="mt-2 text-indigo-100">
             Review and update facility statuses.
            </p>
          </div>
        </div>

        {/* Facilities Table */}
        <div className="px-6 py-8">
          {/* Check if facilities array exists and has items */}
          {facilities && facilities.length > 0 ? (
            <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Map through the facilities array */}
                  {facilities.map((facility) => (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{facility.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                            {facility.location?.city ? `${facility.location.city}, ${facility.location.state || 'N/A'}` : 'Location N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.ownerId ? `${facility.ownerId.substring(0, 6)}...` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${facility.status === 'approved' ? 'bg-green-100 text-green-800' :
                            facility.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            facility.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {facility.status ? facility.status.charAt(0).toUpperCase() + facility.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.createdAt ? facility.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Edit/View Link */}
                          <Link
                            href={`/admindashboard/facilities/edit?id=${facility.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Edit Facility"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>

                          {/* Approve Button */}
                          {facility.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(facility.id, 'approved')}
                              disabled={isInitialLoading || isUpdatingStatus[facility.id]}
                              className="text-green-600 hover:text-green-900 p-1.5 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Approve Facility"
                              aria-label={`Approve ${facility.name}`}
                            >
                              {isUpdatingStatus[facility.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {/* Reject Button */}
                          {facility.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(facility.id, 'rejected')}
                              disabled={isInitialLoading || isUpdatingStatus[facility.id]}
                              className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Reject Facility"
                              aria-label={`Reject ${facility.name}`}
                            >
                              {isUpdatingStatus[facility.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Items per page:</span>
                <select
                    className="bg-gray-100 rounded-lg outline-none p-2 text-sm border border-gray-200"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                    disabled={isInitialLoading}
                >
                    {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                    <option key={num} value={num}>{num} items</option>
                    ))}
                </select>
                </div>

                <div className="flex gap-2">
                <button
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage || isInitialLoading}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </button>
                <button
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || isInitialLoading}
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </button>
                </div>
            </div>
            </>
          ) : (
            // Handle case where facilities array is empty or not yet loaded (but initial loading is done)
            <div className="text-center py-8 text-gray-500">
              <p>{isInitialLoading ? 'Loading...' : 'No facilities found.'}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminFacilitiesPage;