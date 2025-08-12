'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getFacilitiesByOwnerId } from '@/firebase/facilities/read';
import { deleteFacility } from '@/firebase/facilities/delete';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { PenBoxIcon, PlusIcon, Trash2Icon } from 'lucide-react';

const FacilitiesPage = () => {
  const user = useSelector((state) => state.user);
  const router = useRouter();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFacilities();
    }
  }, [user]);

  const fetchFacilities = async () => {
    try {
      const data = await getFacilitiesByOwnerId(user.uid);
      setFacilities(data);
    } catch (error) {
      toast.error('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facilityId) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    
    try {
      await deleteFacility(facilityId);
      setFacilities(facilities.filter(f => f.id !== facilityId));
      toast.success('Facility deleted successfully');
    } catch (error) {
      toast.error('Failed to delete facility');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your facilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Facilities</h1>
          <p className="mt-2 text-gray-600">Manage your sports facilities</p>
        </div>
        <Link
          href="/dashboard/facilities/create"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-colors duration-200"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Facility
        </Link>
      </div>

      {facilities.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-8 w-8 text-theme-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No facilities yet</h3>
          <p className="mt-1 text-gray-500 max-w-md mx-auto">
            Get started by creating your first sports facility. You'll be able to manage bookings and availability here.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/facilities/create"
              className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple transition-colors duration-200"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create New Facility
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <div 
              key={facility.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{facility.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {facility.description || "No description provided"}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(facility.status)}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">
                    {facility.location?.city || 'City'}, {facility.location?.state || 'State'}
                  </span>
                </div>
                
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                  <Link
                    href={`/dashboard/facilities/edit?id=${facility.id}`}
                    className="inline-flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-150"
                    title="Edit facility"
                  >
                    <PenBoxIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(facility.id)}
                    className="inline-flex items-center p-2 rounded-lg hover:bg-gray-100 text-red-600 transition-colors duration-150"
                    title="Delete facility"
                  >
                    <Trash2Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;