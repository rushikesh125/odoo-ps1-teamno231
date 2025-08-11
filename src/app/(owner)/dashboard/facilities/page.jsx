'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getFacilitiesByOwnerId } from '@/firebase/facilities/read';
import { deleteFacility } from '@/firebase/facilities/delete';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Pen, PenBoxIcon, Trash, Trash2Icon } from 'lucide-react';

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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading facilities...</p>
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
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Facility
        </Link>
      </div>

      {facilities.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No facilities</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new facility.</p>
          <div className="mt-6">
            <Link
              href="/dashboard/facilities/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Facility
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <div key={facility.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{facility.description}</p>
                  </div>
                  {getStatusBadge(facility.status)}
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {facility.location?.city}, {facility.location?.state}
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Link
                    href={`/dashboard/facilities/edit?id=${facility.id}`}
                    className="text-sm font-medium text-theme-purple hover:text-theme-purple"
                  >
                   <PenBoxIcon />
                  </Link>
                  <button
                    onClick={() => handleDelete(facility.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                   <Trash2Icon/>
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